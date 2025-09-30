package model_entities

type TTSResult struct {
	Result string `json:"result"`
}

type TTSModelVoice struct {
	Name  string `json:"name" validate:"required"`
	Value string `json:"value" validate:"required"`
}

type GetTTSVoicesResponse struct {
	Voices []TTSModelVoice `josn:"voices" validate:"required,dive"`
}
