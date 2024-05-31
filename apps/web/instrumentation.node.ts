import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

/**
 * This file contains the code for open telemetry stack tracing
 */

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: "otel-logger",
  }),
  traceExporter: new ConsoleSpanExporter(),
});

if (process.env.ENVIRONMENT !== "local") {
  sdk.start();
}
