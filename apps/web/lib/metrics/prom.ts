import client from 'prom-client';

export const register = new client.Registry();

export const counter200 = new client.Counter({
  name: 'log_status_code_200',
  help: 'Log status code for 200',
});

export const counter201 = new client.Counter({
  name: 'log_status_code_201',
  help: 'Log status code for 201',
});

export const counter400 = new client.Counter({
  name: 'log_status_code_400',
  help: 'Log status code for 400',
});

export const counter401 = new client.Counter({
  name: 'log_status_code_401',
  help: 'Log status code for 401',
});

export const counter500 = new client.Counter({
  name: 'log_status_code_500',
  help: 'Log status code for 500',
});

export const httpRequestCount = new client.Counter({
  name: 'total_http_request_count',
  help: 'Total HTTP Request Count',
});

export const httpRequestTimeTaken = new client.Counter({
  // in millisecond
  name: 'http_request_time_taken',
  help: 'HTTP Request Time Taken',
});

register.registerMetric(counter200);
register.registerMetric(counter201);
register.registerMetric(counter400);
register.registerMetric(counter401);
register.registerMetric(counter500);
register.registerMetric(httpRequestCount);
register.registerMetric(httpRequestTimeTaken);
client.collectDefaultMetrics({ register });
