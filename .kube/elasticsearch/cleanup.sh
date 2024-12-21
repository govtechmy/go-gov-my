#!/bin/bash

echo "1. Deleting Elasticsearch resources..."
kubectl delete -k base --ignore-not-found=true

echo "2. Deleting operator..."
kubectl delete -k operator --ignore-not-found=true

echo "3. Waiting for operator to be fully removed..."
kubectl wait --for=delete --timeout=60s deployment/elastic-operator -n gogov 2>/dev/null || true

echo "4. Deleting CRDs..."
kubectl delete -k crds --ignore-not-found=true

echo "Cleanup complete. You can now run deploy.sh for a fresh installation."