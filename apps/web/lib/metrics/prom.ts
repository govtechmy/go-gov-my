import client from 'prom-client';

export const promClient = client;

export const counter200 = new promClient.Counter({
  name: 'log_status_code_200',
  help: 'Log status code for 200',
});

export const counter201 = new promClient.Counter({
  name: 'log_status_code_201',
  help: 'Log status code for 201',
});

export const counter400 = new promClient.Counter({
  name: 'log_status_code_400',
  help: 'Log status code for 400',
});

export const counter401 = new promClient.Counter({
  name: 'log_status_code_401',
  help: 'Log status code for 401',
});

export const counter500 = new promClient.Counter({
  name: 'log_status_code_500',
  help: 'Log status code for 500',
});

export const httpRequestCount = new promClient.Counter({
  name: 'total_http_request_count',
  help: 'Total HTTP Request Count',
});

export const httpRequestTimeTaken = new promClient.Counter({
  // in millisecond
  name: 'http_request_time_taken',
  help: 'HTTP Request Time Taken',
});

export const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
