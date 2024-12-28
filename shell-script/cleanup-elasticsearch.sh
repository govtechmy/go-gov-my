#!/bin/bash

echo "Cleaning up Elasticsearch resources..."

# Delete only Elasticsearch-specific resources
kubectl delete elasticsearch gogov-elasticsearch -n gogov
kubectl delete pvc elasticsearch-data-gogov-elasticsearch-es-default-0 -n gogov
kubectl delete pv elasticsearch-data-gogov-elasticsearch-es-default-0
kubectl delete storageclass gp3-elasticsearch

# Wait for resources to be deleted
echo "Waiting for resources to be deleted..."
kubectl wait --for=delete elasticsearch/gogov-elasticsearch -n gogov --timeout=120s

echo "Cleanup complete"