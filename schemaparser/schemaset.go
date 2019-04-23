package schemaparser

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"path/filepath"

	"github.com/xeipuuv/gojsonschema"
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
type SchemaSet map[string]*Schema

// NewSchemaSetFromFiles create a SchemaSet from an arry of files. These files can refer each other in their definitions.
func NewSchemaSetFromFiles(files []string) (SchemaSet, error) {
	result := make(SchemaSet)
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
	return result, nil
}

// SimpleProperties returns a map of simple properties for a schema with given id.
func (ss SchemaSet) SimpleProperties(id string) (SimpleProperties, error) {
	result := make(SimpleProperties)
	schema, exists := ss[id]
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
