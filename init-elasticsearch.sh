#!/bin/sh

ELASTICSEARCH_URL='http://elasticsearch:9200'

# Create indices
curl -X PUT -w '\n' "$ELASTICSEARCH_URL/links" --fail
curl -X PUT -w '\n' "$ELASTICSEARCH_URL/idempotent_resources" --fail
curl -X PUT -w '\n' "$ELASTICSEARCH_URL/redirect_metadata" --fail

REDIRECT_METADATA_PIPELINE_ID='redirect_metadata_pipeline'

REDIRECT_METADATA_PIPELINE_CONFIG=$(cat <<EOF
{
    "description": "Processes the redirect_metadata logs from filebeat",
    "processors": [
        {
            "set": {
                "description": "Change the destination index",
                "field": "_index",
                "value": "redirect_metadata"
            }
        },
        {
            "script": {
                "description": "Remove filebeat fields",
                "source": "ctx.remove('agent'); ctx.remove('host'); ctx.remove('ecs'); ctx.remove('input'); ctx.remove('log');"
            }
        },
        {
            "script": {
                "description": "Move the fields in json.redirectMetadata to root",
                "source": "for (entry in ctx['json'].redirectMetadata.entrySet()) { ctx[entry.getKey()] = entry.getValue() } ctx.remove('json');"
            }
        }  
    ]
}
EOF
)

# Create redirect_metadata_pipeline for filebeat
curl "$ELASTICSEARCH_URL/_ingest/pipeline/$REDIRECT_METADATA_PIPELINE_ID" \
--request 'PUT' \
--header 'Content-Type: application/json' \
--data "$REDIRECT_METADATA_PIPELINE_CONFIG" \
--fail \
-v