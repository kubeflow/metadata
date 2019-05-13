package schema

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"
	"testing"

	"github.com/bmatcuk/doublestar"
	"github.com/xeipuuv/gojsonschema"
)

const schemaIDKey = "$id"

var schemaDirs = []string{
	"alpha",
}

type jsonSchema struct {
	ID       string        `json:"$id,omitempty"`
	Examples []interface{} `json:"examples,omitempty"`
}

func TestExamples(t *testing.T) {
	sl, err := loadSchemaLib(schemaDirs)
	if err != nil {
		t.Errorf("failed to load schema as libraries, error: %s", err)
	}
	schemaMap, err := getSchemaMap(sl, schemaDirs)
	if err != nil {
		t.Fatalf("failed to load schema, error: %s", err)
	}
	for _, dir := range schemaDirs {
		examples, err := doublestar.Glob(filepath.Join(dir, "**/*.json"))
		if err != nil {
			t.Errorf("failed to find JSON examples in directory %s: %s", dir, err)
		}
		for _, file := range examples {
			if err := validateExample(file, schemaMap); err != nil {
				t.Errorf("failed to validate example: %s\n", err)
			}
		}
	}
}

func loadSchemaLib(dirs []string) (*gojsonschema.SchemaLoader, error) {
	sl := gojsonschema.NewSchemaLoader()
	sl.Validate = true
	for _, dir := range dirs {
		files, err := doublestar.Glob(filepath.Join(dir, "**/*.json"))
		if err != nil {
			return nil, fmt.Errorf("failed to find schema in directory %s: %s", dir, err)
		}
		for _, file := range files {
			path, err := filepath.Abs(file)
			if err != nil {
				return nil, fmt.Errorf("failed to get absolute file path: %s", err)
			}
			if err = sl.AddSchemas(gojsonschema.NewReferenceLoader("file://" + path)); err != nil {
				return nil, fmt.Errorf("failed to add schema in %s:%s", path, err)
			}
			fmt.Printf("loaded schema file as library: %s.\n", path)
		}
	}
	return sl, nil
}

func getSchemaMap(schemalib *gojsonschema.SchemaLoader, dirs []string) (map[string]*gojsonschema.Schema, error) {
	result := make(map[string]*gojsonschema.Schema)
	for _, dir := range dirs {
		files, err := doublestar.Glob(filepath.Join(dir, "**/*.json"))
		if err != nil {
			return nil, fmt.Errorf("failed to find schema in directory %s: %s", dir, err)
		}
		for _, file := range files {
			path, err := filepath.Abs(file)
			if err != nil {
				return nil, fmt.Errorf("failed to get absolute file path: %s", err)
			}
			id, err := extractID(path, schemaIDKey)
			if err != nil {
				return nil, err
			}
			if !strings.HasSuffix(id, file) {
				return nil, fmt.Errorf("$id mismatches file relative path. $id: %s, relative path: %s", id, file)
			}
			if _, exists := result[id]; exists {
				return nil, fmt.Errorf("duplicated $id %s in file %s", id, file)
			}
			s, err := schemalib.Compile(gojsonschema.NewReferenceLoader("file://" + path))
			if err != nil {
				return nil, fmt.Errorf("failed to compile schema in %s:%s", path, err)
			}
			result[id] = s
			fmt.Printf("loaded schema file %s with $id %s.\n", path, id)
		}
	}
	return result, nil
}

func validateExample(file string, schemaMap map[string]*gojsonschema.Schema) error {
	b, _ := ioutil.ReadFile(file)
	var data jsonSchema
	if err := json.Unmarshal(b, &data); err != nil {
		return err
	}
	id := data.ID
	if data.Examples == nil {
		return fmt.Errorf("no examples found in %s. please add examples.", file)
	}
	for _, example := range data.Examples {
		result, err := schemaMap[id].Validate(gojsonschema.NewGoLoader(example))
		if err != nil {
			return fmt.Errorf("failed to validate example: %s", err)
		}
		if !result.Valid() {
			return fmt.Errorf("invalide example in file %s: %s", file, result.Errors())
		}
	}
	return nil
}

func extractID(file string, idKey string) (string, error) {
	plan, _ := ioutil.ReadFile(file)
	var data map[string]interface{}
	if err := json.Unmarshal(plan, &data); err != nil {
		return "", err
	}
	id, exists := data[idKey]
	if !exists {
		return "", fmt.Errorf("no %s key found in %s", idKey, file)
	}
	return id.(string), nil

}
