package main

import (
	"encoding/json"
	"io"
	"net/http"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	// Generate a bcrypt hash of the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

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

	// begin the password hashing process
	if link.Password != "" {
		hashedPassword, err := HashPassword(link.Password)
		if err != nil {
			logHandler(repository.ErrUnmarshalling, err)
			errLinkHandler(w, err)
			return
		}
		link.Password = hashedPassword
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

// [PATCH] Link
func updateLinkHandler(w http.ResponseWriter, r *http.Request, linkRepo *es.LinkRepo, idempotentResourceRepo *es.IdempotentResourceRepo) {
	if !(r.Method == "PATCH") {
		errLinkHandler(w, repository.ErrMethodNotAllowed)
		return
	}

	linkID := strings.Split(r.URL.Path, "/")[2]
	if linkID == "" {
		errLinkHandler(w, repository.ErrMissingParameters)
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

	var updateData repository.UpdateLinkData
	err = json.Unmarshal(body, &updateData)
	if err != nil {
		logHandler(repository.ErrUnmarshalling, err)
		errLinkHandler(w, err)
		return
	}

	if err := linkRepo.UpdateLink(ctx, linkID, updateData); err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}

	// Save idempotent resource
	err = idempotentResourceRepo.SaveIdempotentResource(ctx, *idempotentResource)
	if err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}
}

func disableLinkPasswordHandler(w http.ResponseWriter, r *http.Request, linkID string, linkRepo *es.LinkRepo, idempotentResourceRepo *es.IdempotentResourceRepo) {
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

	if err := linkRepo.DisableLinkPassword(ctx, linkID); err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}

	// Save idempotent resource
	err = idempotentResourceRepo.SaveIdempotentResource(ctx, *idempotentResource)
	if err != nil {
		logHandler(repository.ErrGeneralMessage, err)
		errLinkHandler(w, err)
		return
	}
}
