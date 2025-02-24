import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import {
  SEMRESATTRS_SERVICE_INSTANCE_ID,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
} from '@opentelemetry/semantic-conventions';

const otlpExporter = new OTLPTraceExporter({
  url:
    process.env.NODE_ENV === 'production'
      ? 'http://jaeger:4318/v1/traces'
      : 'http://localhost:4318/v1/traces',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'gogov-web',
    [SEMRESATTRS_SERVICE_NAMESPACE]: 'gogov',
    [SEMRESATTRS_SERVICE_INSTANCE_ID]: 'gogov-web',
  }),
  spanProcessor: new SimpleSpanProcessor(otlpExporter),
});
sdk.start();
