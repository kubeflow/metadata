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

	"github.com/stretchr/testify/assert"
)

var (
	testSchemaFile = "testdata/ext.json"
)

func TestLoadSchemaJSON(t *testing.T) {
	sj, err := schemaJSON(testSchemaFile)
	assert.Nil(t, err, "Failed to load schema into SchemaJSON struct.")
	assert.Equal(t, "object", sj.GetType(), "Expect the type to be object.")
	assert.Equal(t, false, sj.IsSimpleType(), "Expect the type is not a simple type.")
	assert.Equal(t, 3, len(sj.Properties), "Expect 3 field are defined as properties.")
	assert.Equal(t, "array", sj.Properties["array-field"].GetType(), "Expect the type to be array.")
	assert.Equal(t, false, sj.Properties["array-field"].IsSimpleType(), "Expect the type is not a simple type.")
	assert.Equal(t, "integer", sj.Properties["integer-field"].GetType(), "Expect the type to be integer.")
	assert.Equal(t, true, sj.Properties["integer-field"].IsSimpleType(), "Expect the type is a simple type.")
	assert.Equal(t, "number", sj.Properties["number-field"].GetType(), "Expect the type to be number.")
	assert.Equal(t, true, sj.Properties["number-field"].IsSimpleType(), "Expect the type is a simple type.")
}
