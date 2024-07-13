package main

import (
	"net/http"
	"redirect-server/repository"
)

func errRedirectHandler(w http.ResponseWriter, err error) {
	switch err {
	case repository.ErrLinkNotFound:
		http.Error(w, "Link not found", http.StatusNotFound)
	default:
		http.Error(w, "server error", http.StatusInternalServerError)
	}
}