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
	assert.Equal(t, false, sj.isSimpleType(), "Expect the type is not a simple type.")
	assert.Equal(t, 3, len(sj.Properties), "Expect 3 field are defined as properties.")
	assert.Equal(t, "array", sj.Properties["array-field"].GetType(), "Expect the type to be array.")
	assert.Equal(t, false, sj.Properties["array-field"].isSimpleType(), "Expect the type is not a simple type.")
	assert.Equal(t, "integer", sj.Properties["integer-field"].GetType(), "Expect the type to be integer.")
	assert.Equal(t, true, sj.Properties["integer-field"].isSimpleType(), "Expect the type is a simple type.")
	assert.Equal(t, "number", sj.Properties["number-field"].GetType(), "Expect the type to be number.")
	assert.Equal(t, true, sj.Properties["number-field"].isSimpleType(), "Expect the type is a simple type.")
}
