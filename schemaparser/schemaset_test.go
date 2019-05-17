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
	"io/ioutil"
	"testing"

	"github.com/google/go-cmp/cmp"
)

const (
	schemaDir       = "../schema/alpha"
	extID           = "http://github.com/kubeflow/metadata/schemaparser/testdata/ext.json"
	dataSetID       = "http://github.com/kubeflow/metadata/schema/alpha/artifacts/data_set.json"
	dataSetTypeName = "namespaces/kubeflow.org/kinds/data_set/versions/alpha"
)

func TestNewSchemaSetFromDirForAlphaSchemas(t *testing.T) {
	if _, err := NewSchemaSetFromADir(schemaDir); err != nil {
		t.Fatalf("failed to parse schemas from a directory: %s", err)
	}
}
func TestSchemaTypeName(t *testing.T) {
	ss, err := NewSchemaSetFromADir(schemaDir)
	if err != nil {
		t.Fatalf("failed to parse schemas from a directory: %s", err)
	}
	typeNameMap := make(map[string]string)
	for id := range ss.Schemas {
		tn, err := ss.TypeName(id)
		if err != nil {
			t.Logf("failed to get type name: %s", err)
			continue
		}
		typeNameMap[id] = tn
	}
	if typeNameMap[dataSetID] != dataSetTypeName {
		t.Fatalf("Expect to get data_set type name %s, but got %s", dataSetTypeName, typeNameMap[dataSetID])
	}
}

func TestSimpleProperitesInSelfContainedSchema(t *testing.T) {
	ss, err := NewSchemaSetFromFiles([]string{"testdata/base.json"})
	if err != nil {
		t.Fatalf("failed to parse schemas from files: %s", err)
	}
	// Extract the only id in the map
	var id string
	for k := range ss.Schemas {
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
	sp, err := ss.SimpleProperties(extID)
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

func TestAddSchema(t *testing.T) {
	ss, err := NewSchemaSetFromFiles([]string{"testdata/base.json"})
	if err != nil {
		t.Fatalf("failed to parse schemas from files: %s", err)
	}

	b, err := ioutil.ReadFile("testdata/ext.json")
	if err != nil {
		t.Fatalf("failed to read file: %s", err)
	}
	id, err := ss.AddSchema(b)
	if err != nil || id != extID {
		t.Fatalf("Failed to add schema: got id %s, err %v", id, err)
	}
}
