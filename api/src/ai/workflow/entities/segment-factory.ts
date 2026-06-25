import { File } from "@/service/libs/file/file";
import { Segment, SegmentType } from "./segment";

export const noneSegment = (): Segment => ({
  type: SegmentType.NONE,
});

export function isFileObject(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "size" in value
  );
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return (proto === Object.prototype || proto === null);
}

export function buildSegment(value: unknown): Segment {
  if (value == null) {
    return noneSegment();
  }

  switch (typeof value) {
    case "string":
      return { type: SegmentType.STRING, value };
    case "number":
      return { type: SegmentType.NUMBER, value };
    case "boolean":
      return { type: SegmentType.BOOLEAN, value };
    case "object":
      break;
    default:
      throw new Error(`unsupported value type: ${typeof value}`);
  }
  console.log('value:', value, isFileObject(value), isPlainObject(value));

  if (isFileObject(value)) {
    return { type: SegmentType.FILE, value };
  }
  if (Array.isArray(value)) {
    return { type: SegmentType.ARRAY, value: value.map(buildSegment) };
  }
  if (!isPlainObject(value)) {
    throw new Error(`unsupported object type: ${value.constructor?.name ?? "unknown"}`);
  }

  return {
    type: SegmentType.OBJECT,
    value: Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        buildSegment(v),
      ]),
    ),
  };
}
