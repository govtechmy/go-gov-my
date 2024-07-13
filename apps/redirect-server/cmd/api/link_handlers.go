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
	ctx := r.Context()

	if !(r.Method == "POST" || r.Method == "PUT") {
		errLinkHandler(w, repository.ErrMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		logHandler(repository.ErrReadBody, err)
		errLinkHandler(w, repository.ErrInternalServer)
		return
	}

	idempotentResource, err := idempotentResourceRepo.TryValidateResources(r, body)

	if err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}

	var link repository.Link
	err = json.Unmarshal(body, &link)
	if err != nil {
		logHandler(repository.ErrUnmarshalling, err)
		errLinkHandler(w, repository.ErrBadRequest)
		return
	}

	existingLink, err := linkRepo.GetLink(ctx, link.Slug)
	if err != nil && err != repository.ErrLinkNotFound {
		errLinkHandler(w, repository.ErrCheckExistingLink)
		return
	}

	if r.Method == "POST" && existingLink != nil {
		errLinkHandler(w, repository.ErrSlugExists)
		return
	}

	if err := linkRepo.SaveLink(ctx, &link); err != nil {
		errLinkHandler(w, repository.ErrInternalServer)
		return
	}

	// idempotentResource = &repository.IdempotentResource{
	// 	IdempotencyKey:       idempotencyKey,
	// 	HashedRequestPayload: hashedReqPayload,
	// }

	// Only save idempotent resource if the link was saved successfully
	if err := idempotentResourceRepo.SaveIdempotentResource(ctx, *idempotentResource); err != nil {
		errLinkHandler(w, repository.ErrInternalServer)
		return
	}

	if r.Method == "POST" {
		w.WriteHeader(http.StatusCreated)
	} else if r.Method == "PUT" {
		w.WriteHeader(http.StatusNoContent)
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
		errLinkHandler(w, repository.ErrInternalServer)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
