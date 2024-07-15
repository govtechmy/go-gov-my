package main

import (
	"context"
	"encoding/json"
	"fmt"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"time"
)

type LinkAnalytics struct {
	LinkID          string           `json:"linkId"`
	Total           int              `json:"total"`
	AggregationDate string           `json:"aggregationDate"` // UTC date in short format YYYY-MM-DD
	CountryCode     AggregatedValues `json:"countryCode"`
	DeviceType      AggregatedValues `json:"deviceType"`
	Browser         AggregatedValues `json:"browser"`
	OperatingSystem AggregatedValues `json:"operatingSystem"`
	Referer         AggregatedValues `json:"referer"`
}

type AggregatedValues = map[string]int

func main() {
	redirectMetadataRepo := es.NewRedirectMetadataRepo()

	todayShortDate := time.Now().Format("2006-01-02")

	// Get redirect metadata
	// TODO: Get by date range
	redirectMetadata, err := redirectMetadataRepo.GetRedirectMetadata(context.TODO())
	if err != nil {
		panic(err)
	}

	// Aggregate
	aggregatedMetadata, err := aggregate(redirectMetadata, todayShortDate)
	if err != nil {
		panic(err)
	}

	// TODO: 3. Send aggregated metadata to Kafka
	json, err := json.MarshalIndent(aggregatedMetadata, "", "  ")
	if err != nil {
		panic(err)
	}
	fmt.Println(string(json))
}

func aggregate(redirectMetadata []repository.RedirectMetadata, shortDate string) ([]LinkAnalytics, error) {
	// Map LinkID to analytics
	analyticsMap := make(map[string]*LinkAnalytics)

	for _, metadata := range redirectMetadata {
		a := analyticsMap[metadata.LinkID]
		if a == nil {
			a = NewLinkAnalytics(metadata.LinkID, shortDate)
			analyticsMap[metadata.LinkID] = a
		}

		a.Total += 1
		a.CountryCode[metadata.CountryCode] += 1
		a.DeviceType[metadata.DeviceType] += 1
		a.Browser[metadata.Browser] += 1
		a.OperatingSystem[metadata.OperatingSystem] += 1
		a.Referer[metadata.Referer] += 1
	}

	analytics := make([]LinkAnalytics, 0)
	for _, a := range analyticsMap {
		analytics = append(analytics, *a)
	}

	return analytics, nil
}

func NewLinkAnalytics(linkID string, shortDate string) *LinkAnalytics {
	return &LinkAnalytics{
		LinkID:          linkID,
		Total:           0,
		AggregationDate: shortDate,
		CountryCode:     make(map[string]int),
		DeviceType:      make(map[string]int),
		Browser:         make(map[string]int),
		OperatingSystem: make(map[string]int),
		Referer:         make(map[string]int),
	}
}
