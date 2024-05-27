/**
 *  
 * 
 * 
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'otel-logger',
  }),
  traceExporter: new ConsoleSpanExporter(),
});

sdk.start();

// implement tracing
// const { trace } = require('@opentelemetry/api');
// const {
//   SEMATTRS_CODE_FUNCTION,
//   SEMATTRS_CODE_FILEPATH,
// } = require('@opentelemetry/semantic-conventions');

// return tracer.startActiveSpan(`rollOnce:`, (span) => {
//   span.setAttribute(SEMATTRS_CODE_FUNCTION, 'function name');
//   span.setAttribute(SEMATTRS_CODE_FILEPATH, __filename);
//   span.addEvent(<event name>);
//    result = 1+1;
//   span.end();
//   return result;
// });