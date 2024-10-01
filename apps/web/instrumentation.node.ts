// import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
// import { Resource } from '@opentelemetry/resources';
// import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
// import { NodeSDK } from '@opentelemetry/sdk-node';
// //import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
// import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
// const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
// const {
//   getNodeAutoInstrumentations,
// } = require('@opentelemetry/auto-instrumentations-node');
// const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');

// /**
//  * This file contains the code for open telemetry stack tracing
//  */

// const jaegerExporter = new JaegerExporter({
//   serviceName: 'gogov-web',
//   endpoint: 'http://localhost:14268/api/traces',
// });

// const prometheusExporter = new PrometheusExporter({
//   port: 9464,
//   endpoint: '/metrics',
// });

// const metricReader = new PeriodicExportingMetricReader({
//   exporter: prometheusExporter,
//   exportIntervalMillis: 60000,
// });

// const sdk = new NodeSDK({
//   resource: new Resource({
//     [SEMRESATTRS_SERVICE_NAME]: 'otel-logger',
//   }),
//   //traceExporter: new ConsoleSpanExporter(),
//   traceExporter: jaegerExporter,
//   metricReader: metricReader,
//   instrumentations: [
//     getNodeAutoInstrumentations(), // Automatically instrument Node.js libraries (HTTP, Express, etc.)
//   ],
// });

// if (process.env.NODE_ENV === 'production') {
//   // Disable open telmetry for now so the logs can be read
//   sdk.start();
// }

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Create a tracer provider with resource attributes
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'gogov-web', // Service name for tracing
  }),
});

// Set up the OTLP HTTP Trace Exporter
const otlpExporter = new OTLPTraceExporter({
  url: 'http://jaeger:4318/v1/traces', // OTLP HTTP endpoint for Jaeger
  // Optional headers if required, e.g., for authorization:
  // headers: {
  //   'Authorization': 'Bearer <token>',
  // },
});

// Add the OTLP exporter to the tracer provider
provider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));

// Register the provider globally to make it available to the application
provider.register();

// Register instrumentation only if in production (or another environment as needed)
if (process.env.NODE_ENV === 'production') {
  registerInstrumentations({
    instrumentations: [
      // You can add Node.js auto-instrumentations here, for example:
      // getNodeAutoInstrumentations()
    ],
    tracerProvider: provider, // Use the provider we created
  });
}

console.log('OpenTelemetry tracing initialized.');
