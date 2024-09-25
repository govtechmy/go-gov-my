import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
//import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

/**
 * This file contains the code for open telemetry stack tracing
 */

const jaegerExporter = new PeriodicExportingMetricReader({
  endpoint: 'http://localhost:14268/api/traces',
});

const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics',
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: prometheusExporter,
  exportIntervalMillis: 60000, // Export every 60 seconds (default is 60 seconds)
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'otel-logger',
  }),
  //traceExporter: new ConsoleSpanExporter(),
  traceExporter: jaegerExporter,
  metricReader: metricReader,
});

if (process.env.NODE_ENV === 'production') {
  // Disable open telmetry for now so the logs can be read
  // sdk.start();
}
