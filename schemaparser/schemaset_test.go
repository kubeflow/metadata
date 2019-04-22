package schemaparser

import (
	"path/filepath"
	"testing"

	"github.com/bmatcuk/doublestar"
	_ "github.com/davecgh/go-spew/spew"
	"github.com/google/go-cmp/cmp"
)

var (
	schemaDir = "../schema/alpha"
)

func TestNewSchemaSetFromAlphaFiles(t *testing.T) {
	files, err := doublestar.Glob(filepath.Join(schemaDir, "**/*.json"))
	if err != nil {
		t.Fatalf("failed to find schema in directory %s: %s", schemaDir, err)
	}
	_, err = NewSchemaSetFromFiles(files)
	if err != nil {
		t.Fatalf("failed to parse schemas from files: %s", err)
	}
}

func TestSimpleProperitesInSelfContainedSchema(t *testing.T) {
	ss, err := NewSchemaSetFromFiles([]string{"testdata/base.json"})
	if err != nil {
		t.Fatalf("failed to parse schemas from files: %s", err)
	}
	// Extract the only id in the map
	var id string
	for k, _ := range ss {
		id = k
	}
	sp, err := ss.SimpleProperties(id)
	if err != nil {
		t.Fatalf("failed to get simple properties: %s", err)
	}
	expectedMap := map[string]string{
		"id":         "string",
		"apiversion": "string",
		"category":   "string",
		"kind":       "string",
		"name":       "string",
		"namespace":  "string",
	}
	if !cmp.Equal(expectedMap, map[string]string(sp)) {
		t.Fatalf("Unexpect simple properties. expected = %+v, got = %+v", expectedMap, sp)
	}
}

func TestSimplePropertiesInExtendedSchema(t *testing.T) {
	ss, err := NewSchemaSetFromFiles([]string{"testdata/base.json", "testdata/ext.json"})
	if err != nil {
		t.Fatalf("failed to parse schemas from files: %s", err)
	}
	id := "http://github.com/kubeflow/metadata/schemaparser/testdata/ext.json"
	sp, err := ss.SimpleProperties(id)
	if err != nil {
		t.Fatalf("failed to get simple properties: %s", err)
	}
	expectedMap := map[string]string{
		"id":            "string",
		"apiversion":    "string",
		"category":      "string",
		"kind":          "string",
		"name":          "string",
		"namespace":     "string",
		"string-field":  "string",
		"integer-field": "integer",
		"number-field":  "number",
	}
	if !cmp.Equal(expectedMap, map[string]string(sp)) {
		t.Fatalf("Unexpect simple properties. expected = %+v, got = %+v", expectedMap, sp)
	}
}
