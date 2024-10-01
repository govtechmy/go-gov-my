import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'gogov-web2',
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
});
sdk.start();

// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { registerInstrumentations } from '@opentelemetry/instrumentation';
// import { Resource } from '@opentelemetry/resources';
// import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
// import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// const provider = new NodeTracerProvider({
//   resource: new Resource({
//     [SemanticResourceAttributes.SERVICE_NAME]: 'gogov-web',
//   }),
// });

// const otlpExporter = new OTLPTraceExporter({
//   url: process.env.NODE_ENV === "production" ? 'https://jaeger:4318/v1/traces' : 'http://localhost:4138/v1/traces'
// });

// provider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));

// provider.register();

// registerInstrumentations({
//   instrumentations: [
//     // getNodeAutoInstrumentations()
//   ],
//   tracerProvider: provider,
// });

// console.log('OpenTelemetry tracing initialized.');
