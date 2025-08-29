export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

export function convertToBase64(value: string) {
  return Buffer.from(value).toString("base64");
} 

export function convertToNormalString(value: string) {
  return Buffer.from(value, "base64").toString("utf-8");
}