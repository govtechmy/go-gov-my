package main

import (
	"context"
	"errors"
	"net/http"
	"syscall"
	"time"

	"github.com/olivere/elastic/v7"
)

// Custom retrier for elastic requests
// Read: https://github.com/olivere/elastic/wiki/Retrier-and-Backoff

type ElasticRetrier struct {
	backoff elastic.Backoff
}

func NewElasticRetrier() *ElasticRetrier {
	return &ElasticRetrier{
		backoff: elastic.NewExponentialBackoff(10*time.Millisecond, 8*time.Second),
	}
}

func (r *ElasticRetrier) Retry(ctx context.Context, retry int, req *http.Request, resp *http.Response, err error) (time.Duration, bool, error) {
	// Fail hard on a specific error
	if err == syscall.ECONNREFUSED {
		return 0, false, errors.New("elasticsearch or network down")
	}

	// Stop after 3 retries
	if retry >= 3 {
		return 0, false, nil
	}

	// Let the backoff strategy decide how long to wait and whether to stop
	wait, stop := r.backoff.Next(retry)
	return wait, stop, nil
}
