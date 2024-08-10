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
