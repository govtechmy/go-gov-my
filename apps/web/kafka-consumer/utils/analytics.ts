import { AnalyticsMessage } from 'kafka-consumer/models/AnalyticsSchema';
import crypto from 'node:crypto';

export function consumeAnalytics(
  link,
  aggregatedDate: Date,
  from: Date,
  to: Date,
) {
  const dataObject = JSON.parse(JSON.stringify(link)); // deep clone
  delete dataObject?.linkId;
  return {
    aggregatedDate: new Date(aggregatedDate),
    linkId: link?.linkId,
    from,
    to,
    metadata: dataObject,
  };
}

export function sumTwoObj(obj1, obj2) {
  const clone = { ...obj1 };
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (key === 'asn' && Array.isArray(obj2[key])) {
        clone[key] = mergeASNArrays(clone[key] || [], obj2[key]);
      } else if (typeof obj2[key] === 'number') {
        clone[key] = (clone[key] || 0) + obj2[key];
      } else if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
        clone[key] = sumTwoObj(clone[key] || {}, obj2[key]);
      } else {
        clone[key] = obj2[key];
      }
    }
  }
  return clone;
}

function mergeASNArrays(arr1: any[], arr2: any[]): any[] {
  const merged = [...arr1];
  arr2.forEach((item) => {
    const existingIndex = merged.findIndex(
      (x) => x.asn === item.asn && x.organization === item.organization,
    );
    if (existingIndex >= 0) {
      merged[existingIndex].clicks += item.clicks;
    } else {
      merged.push({ ...item });
    }
  });
  return merged;
}

function getIdempotencyKey(analyticsMessage: AnalyticsMessage): string {
  const { from: date1, to: date2 } = analyticsMessage;

  // Convert dates to ISO strings
  const date1Str = new Date(date1).toISOString();
  const date2Str = new Date(date2).toISOString();

  // Combine the date strings
  const combined = date1Str + date2Str;

  // Create a hash of the combined string
  const hash = crypto.createHash('sha256');
  hash.update(combined);
  return hash.digest('hex');
}

const getIdempotentPayload = (analyticsMessage: AnalyticsMessage) => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(analyticsMessage));
  return hash.digest('hex');
};

export function toIdempotentResource(analyticsMessage: AnalyticsMessage): {
  idempotencyKey: string;
  hashedPayload: string;
} {
  const idempotencyKey = getIdempotencyKey(analyticsMessage);
  const hashedPayload = getIdempotentPayload(analyticsMessage);
  return {
    idempotencyKey,
    hashedPayload,
  };
}
