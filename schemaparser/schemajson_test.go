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
	"testing"
)

var (
	testSchemaFile = "testdata/ext.json"
)

func TestLoadSchemaJSON(t *testing.T) {
	sj, err := schemaJSON(testSchemaFile)
	if err != nil {
		t.Fatal("Failed to load schema into SchemaJSON struct.")
	}
	if len(sj.Properties) != 3 {
		t.Fatal("Expect 3 field are defined as properties.")
	}
	typeTests := []struct {
		exp    string
		actual string
	}{
		{"object", sj.GetType()},
		{"array", sj.Properties["array-field"].GetType()},
		{"integer", sj.Properties["integer-field"].GetType()},
		{"number", sj.Properties["number-field"].GetType()},
	}
	for i, tt := range typeTests {
		if tt.exp != tt.actual {
			t.Errorf("wrong property type in typeTests[%d], got %v, expect %v", i, tt.actual, tt.exp)
		}
	}
	isSimpleTypeTests := []struct {
		exp    bool
		actual bool
	}{
		{false, sj.IsSimpleType()},
		{false, sj.Properties["array-field"].IsSimpleType()},
		{true, sj.Properties["integer-field"].IsSimpleType()},
		{true, sj.Properties["number-field"].IsSimpleType()},
	}
	for i, tt := range isSimpleTypeTests {
		if tt.exp != tt.actual {
			t.Errorf("wrong result fo IsSimpleTypeTests[%d] in , got %v, expect %v", i, tt.actual, tt.exp)
		}
	}
}
