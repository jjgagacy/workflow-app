package model_entities

import "github.com/shopspring/decimal"

type EmbeddingUsage struct {
	Tokens       *int            `json:"tokens" validate:"required"`
	TotalTokens  *int            `json:"total_tokens" validate:"required"`
	UnitPrice    decimal.Decimal `json:"unit_price" validate:"required"`
	PricePerUnit decimal.Decimal `json:"price_per_unit" validate:"required"`
	TotalPrice   decimal.Decimal `json:"total_price" validate:"required"`
	Currency     *string         `json:"currency" validate:"required"`
	Latency      *float64        `json:"latency" validate:"required"`
}

type TextEmbeddingResult struct {
	Model      string         `json:"model" validate:"required"`
	Embeddings [][]float64    `json:"embeddings" validate:"required"`
	Usage      EmbeddingUsage `json:"usage" validate:"required"`
}

type GetTextEmbeddingNumTokensResponse struct {
	NumTokens []int `json:"num_tokens" validate:"required"`
}
