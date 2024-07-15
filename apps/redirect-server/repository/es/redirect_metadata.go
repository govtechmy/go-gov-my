package es

import (
	"context"
	"encoding/json"
	"io"
	"os"
	"redirect-server/repository"
)

type RedirectMetadataRepo struct {
}

func NewRedirectMetadataRepo() *RedirectMetadataRepo {
	return &RedirectMetadataRepo{}
}

func (r *RedirectMetadataRepo) GetRedirectMetadata(ctx context.Context) ([]repository.RedirectMetadata, error) {
	file, err := os.Open("mock_redirect_metadata.json")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	byteValue, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	var metadata []repository.RedirectMetadata
	err = json.Unmarshal(byteValue, &metadata)
	if err != nil {
		return nil, err
	}

	return metadata, nil
}
