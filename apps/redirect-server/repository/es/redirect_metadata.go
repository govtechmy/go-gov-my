package es

import (
	"context"
	"encoding/json"
	"os"
	"redirect-server/repository"
	"time"
)

type RedirectMetadataRepo struct {
}

func NewRedirectMetadataRepo() *RedirectMetadataRepo {
	return &RedirectMetadataRepo{}
}

func (r *RedirectMetadataRepo) GetRedirectMetadata(ctx context.Context, from time.Time, to time.Time) ([]repository.RedirectMetadata, error) {
	// TODO: Fetch from ES, using a file for now to mock the data
	file, err := os.Open("mock_redirect_metadata.json")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var metadata []repository.RedirectMetadata
	err = json.NewDecoder(file).Decode(&metadata)
	if err != nil {
		return nil, err
	}

	return metadata, nil
}
