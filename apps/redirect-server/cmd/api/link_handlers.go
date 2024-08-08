package main

import (
	"encoding/json"
	"io"
	"net/http"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"strings"
)

// [POST, PUT] Link
func indexLinkHandler(w http.ResponseWriter, r *http.Request, linkRepo *es.LinkRepo, idempotentResourceRepo *es.IdempotentResourceRepo) {
	if !(r.Method == "POST" || r.Method == "PUT") {
		errLinkHandler(w, repository.ErrMethodNotAllowed)
		return
	}

	ctx := r.Context()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}

	idempotentResource, err := repository.NewIdempotentResource(*r, body)
	if err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}

	savedIdempotentResource, err := idempotentResourceRepo.GetSavedIdempotentResource(ctx, idempotentResource.IdempotencyKey)
	if err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}

	// If idempotent resource was already saved before
	if savedIdempotentResource != nil {
		// If the request payloads don't match
		if idempotentResource.HashedRequestPayload != savedIdempotentResource.HashedRequestPayload {
			logHandler(repository.ErrGeneralMessage, repository.ErrIdempotentBadRequest)
			errLinkHandler(w, repository.ErrIdempotentBadRequest)
			return
		}
		// Return early with successful response
		return
	}

	var link repository.Link
	err = json.Unmarshal(body, &link)
	if err != nil {
		logHandler(repository.ErrUnmarshalling, err)
		errLinkHandler(w, err)
		return
	}

	if err := linkRepo.SaveLink(ctx, &link); err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}

	// Save idempotent resource when link is saved successfuly
	err = idempotentResourceRepo.SaveIdempotentResource(ctx, *idempotentResource)
	if err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}
}

// [DELETE] Link
func deleteLinkHandler(w http.ResponseWriter, r *http.Request, linkRepo *es.LinkRepo) {
	ctx := r.Context()

	if r.Method != "DELETE" {
		errLinkHandler(w, repository.ErrMethodNotAllowed)
		return
	}

	linkId := strings.Split(r.URL.Path, "/")[2]
	if linkId == "" {
		errLinkHandler(w, repository.ErrMissingParameters)
		return
	}

	err := linkRepo.DeleteLink(ctx, linkId)
	if err != nil {
		logHandler(repository.ErrDeleting, err)
		errLinkHandler(w, err)
		return
	}
}
