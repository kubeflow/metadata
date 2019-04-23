package schemaparser

const (
	// IntegerType represents JSON schema integer type
	IntegerType = "integer"
	// StringType represents JSON schema string type
	StringType = "string"
	// NumberType represents JSON schema number type
	NumberType = "number"
	// BooleanType represents JSON schema boolean type
	BooleanType = "boolean"
	// ArrayType represents JSON schema array type
	ArrayType = "array"
	// ObjectType represents JSON schema object type
	ObjectType = "object"
)

// Reference represents a JSON schema pointer.
type Reference string

// SchemaJSON is a Go struct representation of a JSON schema.
type SchemaJSON struct {
	ID          string `json:"$id,omitempty"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Version     string `json:"version,omitempty"`

	Default  interface{} `json:"default,omitempty"`
	ReadOnly bool        `json:"readOnly,omitempty"`
	Example  interface{} `json:"example,omitempty"`
	Format   string      `json:"format,omitempty"`

	Type interface{} `json:"type,omitempty"`

	Ref    *Reference `json:"$ref,omitempty"`
	Schema *Reference `json:"$schema,omitempty"`

	Definitions map[string]*SchemaJSON `json:"definitions,omitempty"`

	// Numbers
	MultipleOf       float64 `json:"multipleOf,omitempty"`
	Maximum          float64 `json:"maximum,omitempty"`
	ExclusiveMaximum bool    `json:"exclusiveMaximum,omitempty"`
	Minimum          float64 `json:"minimum,omitempty"`
	ExclusiveMinimum bool    `json:"exclusiveMinimum,omitempty"`

	// Strings
	MinLength int    `json:"minLength,omitempty"`
	MaxLength int    `json:"maxLength,omitempty"`
	Pattern   string `json:"pattern,omitempty"`

	// Objects
	MinProperties        int                    `json:"minProperties,omitempty"`
	MaxProperties        int                    `json:"maxProperties,omitempty"`
	Required             []string               `json:"required,omitempty"`
	Properties           map[string]*SchemaJSON `json:"properties,omitempty"`
	Dependencies         map[string]interface{} `json:"dependencies,omitempty"`
	AdditionalProperties interface{}            `json:"additionalProperties,omitempty"`
	PatternProperties    map[string]*SchemaJSON `json:"patternProperties,omitempty"`

	// Arrays
	Items           *SchemaJSON `json:"items,omitempty"`
	MinItems        int         `json:"minItems,omitempty"`
	MaxItems        int         `json:"maxItems,omitempty"`
	UniqueItems     bool        `json:"uniqueItems,omitempty"`
	AdditionalItems interface{} `json:"additionalItems,omitempty"`

	// All
	Enum     []string `json:"enum,omitempty"`
	Constant string   `json:"constant,omitempty"`

	// Schemas
	OneOf []SchemaJSON `json:"oneOf,omitempty"`
	AnyOf []SchemaJSON `json:"anyOf,omitempty"`
	AllOf []SchemaJSON `json:"allOf,omitempty"`
	Not   *SchemaJSON  `json:"not,omitempty"`

	// Links
	Links []*Link `json:"links,omitempty"`
}

// Link represents a Link description.
type Link struct {
	Title        string      `json:"title,omitempty"`
	Description  string      `json:"description,omitempty"`
	HRef         *HRef       `json:"href,omitempty"`
	Rel          string      `json:"rel,omitempty"`
	Method       string      `json:"method,omitempty"`
	Schema       *SchemaJSON `json:"schema,omitempty"`
	TargetSchema *SchemaJSON `json:"targetSchema,omitempty"`
	MediaType    string      `json:"mediaType,omitempty"`
	EncType      string      `json:"encType,omitempty"`
}

// HRef represents a Link href.
type HRef struct {
	href    string
	Order   []string
	Schemas map[string]*SchemaJSON
}

// GetType return the type defined in this schema
func (sj *SchemaJSON) GetType() string {
	if sj.Type == nil {
		return ObjectType
	}
	if t, ok := sj.Type.(string); ok {
		return t
	}
	return ObjectType
}

// IsSimpleType returns if a type is of a simple type, i.e. string, integer or number.
func (sj *SchemaJSON) IsSimpleType() bool {
	t := sj.GetType()
	return t == StringType || t == IntegerType || t == NumberType
}
