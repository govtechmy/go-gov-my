#!/bin/sh

ELASTIC_USERNAME=${ELASTIC_USERNAME}
ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
ELASTIC_URL=${ELASTIC_URL}

# Create redirect_metadata index
curl -u $ELASTIC_USERNAME:$ELASTIC_PASSWORD -k \
  -X PUT "$ELASTIC_URL/redirect_metadata"

# Create idempotent_resources index
curl -u $ELASTIC_USERNAME:$ELASTIC_PASSWORD -k \
  -X PUT "$ELASTIC_URL/idempotent_resources?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "mappings": {
      "dynamic": false,
      "properties": {
        "idempotency_key": {
          "type": "keyword"
        },
        "hashed_request_payload": {
          "type": "keyword"
        }
      }
    }
  }'

# Create links index
curl -u $ELASTIC_USERNAME:$ELASTIC_PASSWORD -k \
 -X PUT "$ELASTIC_URL/links?pretty" \
 -H 'Content-Type: application/json' \
 -d'{
  "mappings": {
    "dynamic": false,
    "properties": {
      "description": {
        "type": "text"
      },
      "id": {
        "type": "keyword"
      },
      "imageUrl": {
        "type": "keyword"
      },
      "slug": {
        "type": "keyword"
      },
      "title": {
        "type": "text"
      },
      "url": {
        "type": "keyword"
      }
    }
  }
 }'
