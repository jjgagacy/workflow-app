import { hashString } from "@/common/utils/hash";
import { VARIABLE_SELECTOR_MIN_LENGTH } from "../constants";
import { Segment, SegmentType } from "./segment";
import { buildSegment } from "./segment-factory";
import { Selector } from "./variables";
import { Injectable, Scope } from "@nestjs/common";
import { FileAttribute } from "@/service/libs/file/file.enum";
import { FileHelper } from "@/service/libs/helpers/file.helper";

// @Injectable({ scope: Scope.REQUEST }) // 💡 设为请求作用域，防止不同请求/不同工作流实例之间的数据串透和内存泄漏
export class VariablePool {
  private readonly values = new Map<string, Map<number, Segment>>();

  constructor() { }

  add(selector: Selector, value: Segment): void {
    if (this.has(selector)) {
      return;
    }

    const [key, hashKey] = this.keys(selector);
    let nodeMap = this.values.get(key);

    if (!nodeMap) {
      nodeMap = new Map<number, Segment>();
      this.values.set(key, nodeMap);
    }

    nodeMap.set(hashKey, value);
  }

  get(selector: Selector): Segment | undefined {
    if (selector.path.length < VARIABLE_SELECTOR_MIN_LENGTH) {
      return undefined;
    }
    const [key, hashKey] = this.keys(selector);
    const value = this.values.get(key)?.get(hashKey);
    if (value) {
      return value;
    }
    // file attribute
    return this.resolveFileAttr(selector);
  }

  set(selector: Selector, value: Segment): void {
    const [key, hashKey] = this.keys(selector);

    // 1. 尝试获取该节点已有的 Map
    let nodeMap = this.values.get(key);

    // 2. 如果之前这个节点从来没有存过任何变量，才去初始化 Map
    if (!nodeMap) {
      nodeMap = new Map<number, Segment>();
      this.values.set(key, nodeMap);
    }

    // 3. 在已有的或新初始化的 Map 中安全地写入/更新该变量的 Hash 键值，绝对不会影响到同节点的兄弟变量
    nodeMap.set(hashKey, value);
  }

  has(selector: Selector): boolean {
    const [key, hashKey] = this.keys(selector);
    return this.values.get(key)?.has(hashKey) ?? false;
  }

  delete(selector: Selector): boolean {
    const [key, hashKey] = this.keys(selector);
    return this.values.get(key)?.delete(hashKey) ?? false;
  }

  private getDirect(selector: Selector): Segment | undefined {
    const [key, hashKey] = this.keys(selector);
    return this.values.get(key)?.get(hashKey);
  }

  private resolveFileAttr(selector: Selector): Segment | undefined {
    if (selector.path.length < VARIABLE_SELECTOR_MIN_LENGTH) {
      return undefined;
    }

    const attr = selector.path[selector.path.length - 1];
    if (!Object.values(FileAttribute).includes(attr as FileAttribute)) {
      return undefined;
    }

    const parentSelector: Selector = {
      nodeId: selector.nodeId,
      path: selector.path.slice(0, -1),
    };

    const fileSegment = this.getDirect(parentSelector);
    if (!fileSegment || fileSegment.type !== SegmentType.FILE) {
      return undefined;
    }

    if (fileSegment.type !== SegmentType.FILE) {
      return undefined;
    }
    const attrValue = FileHelper.getAttr(fileSegment.value, attr as FileAttribute);
    return buildSegment(attrValue);
  }

  clear(): void {
    this.values.clear();
  }

  entries(): IterableIterator<[string, Map<number, Segment>]> {
    return this.values.entries();
  }

  private keys(selector: Selector): [string, number] {
    return [
      selector.nodeId,
      hashString(selector.path.join('.'))
    ];
  }
}
