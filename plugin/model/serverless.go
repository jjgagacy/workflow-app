package model

type ServerlessRunType string

type ServerlessRuntime struct {
	Model
	PluginUniqueIdentifier string            `gorm:"unique;size:255" json:"plugin_unique_identifier"`
	FunctionURL            string            `gorm:"size:255" json:"function_url"`
	FunctionName           string            `gorm:"size:127" json:"function_name"`
	Type                   ServerlessRunType `gorm:"size:127" json:"type"`
	Checksum               string            `gorm:"size:127;index" json:"checksum"`
}
