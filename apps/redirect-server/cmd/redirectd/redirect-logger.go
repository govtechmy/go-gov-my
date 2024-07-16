package main

import (
	"encoding/json"
	"io"
	"net/http"
	"redirect-server/repository"

	"github.com/oschwald/geoip2-golang"
)

type RedirectLogger struct {
	writer io.Writer
	ipDB   *geoip2.Reader
}

func NewRedirectLogger(w io.Writer, ipDB *geoip2.Reader) *RedirectLogger {
	return &RedirectLogger{
		writer: w,
		ipDB:   ipDB,
	}
}

func (l *RedirectLogger) Log(req http.Request, link repository.Link) error {
	redirectMetadata := repository.NewRedirectMetadata(req, l.ipDB, link)
	err := json.NewEncoder(l.writer).Encode(redirectMetadata)
	if err != nil {
		return err
	}
	return nil
}
