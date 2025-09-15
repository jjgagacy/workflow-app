package plugin_entites

type ConfigOption struct {
	Value string     `json:"value"`
	Label I18nObject `json:"label"`
}

type ProviderConfig struct {
	Name     string         `json:"name"`
	Type     string         `json:"type"`
	Scope    *string        `json:"scope"`
	Required bool           `json:"required"`
	Default  any            `json:"deault"`
	Options  []ConfigOption `json:"options"`
	Label    *I18nObject    `json:"label"`
	Help     *I18nObject    `json:"help"`
	URL      *string        `json:"url"`
}
