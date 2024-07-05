package redirectserver

import (
	"context"
	"time"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

func NewTraceProvider(collectorURL string) (*trace.TracerProvider, error) {
	traceExporter, err := otlptracehttp.New(
		context.TODO(),
		otlptracehttp.WithEndpoint(collectorURL),
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String("redirect-server"),
		)),
		trace.WithBatcher(traceExporter,
			// Default is 5s. Set to 1s for demonstrative purposes.
			trace.WithBatchTimeout(time.Second)),
	)

	return traceProvider, nil
}
