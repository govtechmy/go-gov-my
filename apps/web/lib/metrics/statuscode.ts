import client from 'prom-client';

export const promClient = client;

export const counterProm = new promClient.Counter({
  name: 'abc',
  help: 'fafasdf',
});

export const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
