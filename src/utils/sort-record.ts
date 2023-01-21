export default function sortRecord<T>(
  unordered: Record<string, T>
): Record<string, T> {
  return Object.keys(unordered)
    .sort()
    .reduce((obj: any, key: any) => {
      obj[key] = (unordered as any)[key];
      return obj;
    }, {});
}
