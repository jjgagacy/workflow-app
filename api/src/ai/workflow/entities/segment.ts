import { File } from "@/service/libs/file/file";

export enum SegmentType {
  NONE = 'none',

  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',

  FILE = 'file',
  OBJECT = 'object',
  ARRAY = 'array'
}

export interface BaseSegment {
  type: SegmentType;
}

export interface NoneSegment extends BaseSegment {
  type: SegmentType.NONE;
}

export interface StringSegment extends BaseSegment {
  type: SegmentType.STRING;
  value: string;
}

export interface NumberSegment extends BaseSegment {
  type: SegmentType.NUMBER;
  value: number;
}

export interface BooleanSegment extends BaseSegment {
  type: SegmentType.BOOLEAN;
  value: boolean;
}

export interface FileSegment extends BaseSegment {
  type: SegmentType.FILE;
  value: File;
}

export interface ObjectSegment extends BaseSegment {
  type: SegmentType.OBJECT;
  value: Record<string, Segment>;
}

export interface ArraySegment extends BaseSegment {
  type: SegmentType.ARRAY;
  value: Segment[];
}

export type Segment =
  | NoneSegment
  | StringSegment
  | NumberSegment
  | BooleanSegment
  | FileSegment
  | ObjectSegment
  | ArraySegment;
