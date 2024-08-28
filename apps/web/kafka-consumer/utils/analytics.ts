import { AnalyticsMessage } from "kafka-consumer/models/AnalyticsSchema";
import crypto from "node:crypto";

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
  const clone = {}; // deep clone
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      clone[key] = obj1[key];
    }
  }
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (typeof obj2[key] === "number") {
        if (clone.hasOwnProperty(key)) {
          clone[key] += obj2[key];
        } else {
          clone[key] = obj2[key];
        }
      } else if (typeof obj2[key] === "object") {
        clone[key] = sumTwoObj(obj2[key], clone[key]);
      }
    }
  }
  return clone;
}

function getIdempotencyKey(analyticsMessage: AnalyticsMessage): string {
  const { from: date1, to: date2 } = analyticsMessage;

  // Convert dates to ISO strings
  const date1Str = new Date(date1).toISOString();
  const date2Str = new Date(date2).toISOString();

  // Combine the date strings
  const combined = date1Str + date2Str;

  // Create a hash of the combined string
  const hash = crypto.createHash("sha256");
  hash.update(combined);
  return hash.digest("hex");
}

const getIdempotentPayload = (analyticsMessage: AnalyticsMessage) => {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(analyticsMessage));
  return hash.digest("hex");
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
