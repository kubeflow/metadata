// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package schemaparser

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"path/filepath"

	"github.com/bmatcuk/doublestar"
	"github.com/xeipuuv/gojsonschema"
)

const (
	namespacePropertyName = "namespace"
	kindPropertyName      = "kind"
	versionPropertyName   = "apiversion"
	idPropertyName        = "id"
	namePropertyName      = "name"
)

// SimpleProperties are properties of type integer, double and string. The map is from property name to its type.
type SimpleProperties map[string]string

// Schema represent a JSON schema.
type Schema struct {
	// JSON is the Go struct representation of the schema itself.
	JSON *SchemaJSON
	// Validator is a compiled schema for validating JSON data.
	Validator *gojsonschema.Schema
}

// SchemaSet maps schema $id to its Schema. SchemaSet is inclusive, i.e. all references of schemas in this schema set must also be included in the set.
type SchemaSet struct {
	loader  *gojsonschema.SchemaLoader
	Schemas map[string]*Schema
}

// NewSchemaSetFromADir create a SchemaSet from all schema files under a directory and its descendant directories.
func NewSchemaSetFromADir(dir string) (*SchemaSet, error) {
	files, err := doublestar.Glob(filepath.Join(dir, "**/*.json"))
	if err != nil {
		return nil, fmt.Errorf("failed to find schema in directory %s: %s", dir, err)
	}
	return NewSchemaSetFromFiles(files)
}

// NewSchemaSetFromFiles create a SchemaSet from an arry of files. These files can refer each other in their definitions.
func NewSchemaSetFromFiles(files []string) (*SchemaSet, error) {
	result := make(map[string]*Schema)
	sl, err := loadSchemas(files)
	if err != nil {
		return nil, err
	}
	for _, file := range files {
		path, err := filepath.Abs(file)
		if err != nil {
			return nil, fmt.Errorf("failed to get absolute file path: %s", err)
		}
		schemajson, err := schemaJSON(path)
		if err != nil {
			return nil, err
		}
		validator, err := sl.Compile(gojsonschema.NewReferenceLoader("file://" + path))
		if err != nil {
			return nil, fmt.Errorf("failed to compile schema in %s: %s", path, err)
		}
		if _, exists := result[schemajson.ID]; exists {
			return nil, fmt.Errorf("duplicated $id %s in %s", schemajson.ID, file)
		}
		result[schemajson.ID] = &Schema{
			JSON:      schemajson,
			Validator: validator,
		}
	}
	return &SchemaSet{
		loader:  sl,
		Schemas: result,
	}, nil
}

// AddSchema adds a new schema into the set. It returns the schema ID or an error.
func (ss *SchemaSet) AddSchema(b []byte) (string, error) {
	sj, err := NewSchemaJSON(b)
	if err != nil {
		return "", fmt.Errorf("invaid schema: %s", err)
	}
	if _, exists := ss.Schemas[sj.ID]; exists {
		return sj.ID, nil
	}
	sl := gojsonschema.NewBytesLoader(b)
	validator, err := ss.loader.Compile(sl)
	if err != nil {
		return "", fmt.Errorf("failed to compile schema: %s", err)
	}
	ss.Schemas[sj.ID] = &Schema{
		JSON:      sj,
		Validator: validator,
	}
	return sj.ID, nil
}

// TypeName extract the {namespace}/{version} as type namepace and {kind} as type name,
// where {namespace}, {kind}, and {version} are from constant string properties defined in JSON schema.
func (ss *SchemaSet) TypeName(id string) (namespace string, name string, err error) {
	namespace, err = ss.ConstantStringType(id, namespacePropertyName)
	if err != nil {
		return "", "", err
	}
	kind, err := ss.ConstantStringType(id, kindPropertyName)
	if err != nil {
		return "", "", err
	}
	version, err := ss.ConstantStringType(id, versionPropertyName)
	if err != nil {
		return "", "", err
	}
	return fmt.Sprintf("%s/%s", namespace, version), kind, nil
}

// ConstantStringType returns the constant value of a string type.
func (ss *SchemaSet) ConstantStringType(id, name string) (string, error) {
	p, err := ss.PropertyType(id, name)
	if err != nil {
		return "", err
	}
	if p.Constant == "" {
		return "", fmt.Errorf("property %q is not constant in %s, SchemaJSON %+v", name, id, p)
	}
	return p.Constant, nil
}

// PropertyType returns the type definition of property with given name in the schema of id.
func (ss *SchemaSet) PropertyType(id, name string) (*SchemaJSON, error) {
	schema, exists := ss.Schemas[id]
	if !exists {
		return nil, fmt.Errorf("failed to find schema with $id %s", id)
	}
	for p, sj := range schema.JSON.Properties {
		if p == name {
			return sj, nil
		}
	}
	// Find properties in Allof in reverse order.
	l := len(schema.JSON.AllOf)
	for i := l - 1; i >= 0; i-- {
		parent := schema.JSON.AllOf[i]
		for p, sj := range parent.Properties {
			if p == name {
				return sj, nil
			}
		}
		if parent.Ref != nil {
			sj, err := ss.PropertyType((string)(*parent.Ref), name)
			if err == nil {
				return sj, nil
			}
		}
	}
	return nil, fmt.Errorf("failed to find property %q in %q", name, id)
}

// SimpleProperties returns a map of simple properties for a schema with given id.
func (ss *SchemaSet) SimpleProperties(id string) (SimpleProperties, error) {
	result := make(SimpleProperties)
	schema, exists := ss.Schemas[id]
	if !exists {
		return nil, fmt.Errorf("failed to find schema with $id %s", id)
	}
	for _, parent := range schema.JSON.AllOf {
		if parent.Ref != nil {
			props, err := ss.SimpleProperties((string)(*parent.Ref))
			if err != nil {
				return nil, fmt.Errorf("failed to resolve %s in AllOf fields in %s: %s", *parent.Ref, id, err)
			}
			for k, v := range props {
				result[k] = v
			}
		}
		addSimpleProperties(parent.Properties, result)
	}
	addSimpleProperties(schema.JSON.Properties, result)
	return result, nil
}

func addSimpleProperties(properties map[string]*SchemaJSON, output SimpleProperties) {
	if properties == nil {
		return
	}
	for p, schema := range properties {
		if schema.IsSimpleType() {
			output[p] = schema.GetType()
		}
	}
}

func loadSchemas(files []string) (*gojsonschema.SchemaLoader, error) {
	sl := gojsonschema.NewSchemaLoader()
	sl.Validate = true
	for _, file := range files {
		path, err := filepath.Abs(file)
		if err != nil {
			return nil, fmt.Errorf("failed to get absolute file path: %s", err)
		}
		if err = sl.AddSchemas(gojsonschema.NewReferenceLoader("file://" + path)); err != nil {
			return nil, fmt.Errorf("failed to add schema in %s:%s", path, err)
		}
	}
	return sl, nil
}

func schemaJSON(file string) (*SchemaJSON, error) {
	schemajson := &SchemaJSON{}
	b, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %s", file, err)
	}
	err = json.Unmarshal(b, schemajson)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal schema in %s: %s", file, err)
	}
	if schemajson.ID == "" {
		return nil, fmt.Errorf("missing $id in file %s", file)
	}
	return schemajson, nil
}
