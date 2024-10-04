import client from 'prom-client';

export const promClient = client;

export const counterProm = new promClient.Counter({
  name: 'log_status_code',
  help: 'Log status code',
});

export const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
