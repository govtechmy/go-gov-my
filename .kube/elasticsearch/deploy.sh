#!/bin/bash

# Create namespace if it doesn't exist
echo "0. Ensuring gogov namespace exists..."
kubectl create namespace gogov --dry-run=client -o yaml | kubectl apply -f -

echo "1. Applying CRDs..."
kubectl apply -k crds

echo "Waiting for CRDs to be established..."
kubectl wait --for=condition=established --timeout=60s crd/elasticsearches.elasticsearch.k8s.elastic.co

echo "2. Applying operator..."
kubectl apply -k operator

echo "Waiting for operator to be ready..."
kubectl wait --for=condition=ready pod -l control-plane=elastic-operator -n elastic-system --timeout=90s

echo "3. Applying Elasticsearch resources..."
kubectl apply -k base 

echo "Waiting for Elasticsearch StatefulSet to be created..."
sleep 10

echo "Checking Elasticsearch deployment status..."
kubectl get elasticsearch -n gogov
kubectl get pods -n gogov
kubectl get events -n gogov --sort-by='.lastTimestamp'
kubectl get elasticsearch -n gogov
echo "Waiting for Elasticsearch pod to be ready (timeout: 300s)..."
kubectl wait --for=condition=ready pod -l elasticsearch.k8s.elastic.co/cluster-name=gogov-elasticsearch -n gogov --timeout=300s

echo "Final status:"
kubectl get elasticsearch -n gogov -o wide 