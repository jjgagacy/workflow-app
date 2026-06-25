import { describe, it, expect, beforeEach } from '@jest/globals';
import { FileAttribute, FileTransferMethod, FileType } from "@/service/libs/file/file.enum";
import { VariablePool } from '@/ai/workflow/entities/variable-pool';
import { NumberSegment, Segment, SegmentType, StringSegment } from '@/ai/workflow/entities/segment';
import { Selector } from '@/ai/workflow/entities/variables';
import { File } from '@/service/libs/file/file';
import { url } from 'inspector/promises';

// 假定常量设置为 2（通常 Dify 中最小路径长度为 2）
// 如果你的真实常量不同，Jest 会根据你的常量定义运行
describe('VariablePool (e2e)', () => {
  let pool: VariablePool;

  // 构造一些常用的测试桩数据 (Mock Segments)
  const mockFileSegment: Segment = {
    type: SegmentType.FILE,
    value: File.create({
      tenantId: 'tenant_123',
      type: FileType.IMAGE,
      transferMethod: FileTransferMethod.REMOTE_URL,
      name: 'avatar.png',
      extension: '.png',
      mimeType: 'image/png',
      size: 1048576,
      url: 'https://example.com/avatar.png'
    })
  };

  const mockTextSegment: Segment = {
    type: SegmentType.STRING,
    value: 'hello world'
  };

  beforeEach(() => {
    // 每次测试前清空或重新实例化，保证用例隔离
    pool = new VariablePool();
  });

  describe('基础存取与覆盖隔离 (CRUD & Defend)', () => {
    it('should add and get a basic variable correctly', () => {
      const selector: Selector = { nodeId: 'node_1', path: ['user', 'name'] };
      pool.add(selector, mockTextSegment);

      const result = pool.get(selector) as StringSegment;
      expect(result).toBeDefined();
      expect(result?.value).toBe('hello world');
    });

    it('should not overwrite sibling variables when calling set() on the same nodeId', () => {
      // 1. 注入第一个变量
      const selector1: Selector = { nodeId: 'node_1', path: ['user', 'firstName'] };
      pool.add(selector1, mockTextSegment);

      // 2. 使用 set() 注入同节点下的第二个变量
      const selector2: Selector = { nodeId: 'node_1', path: ['user', 'lastName'] };
      const newSegment: Segment = { type: SegmentType.STRING, value: 'Doe' };
      pool.set(selector2, newSegment);

      // 3. 断言：核心 Bug 修复验证 —— 注入第二个变量时不应该冲掉第一个变量
      expect(pool.get(selector1)).toBeDefined();
      expect((pool.get(selector1) as StringSegment)?.value).toBe('hello world');
      expect((pool.get(selector2) as StringSegment)?.value).toBe('Doe');
    });
  });

  describe('多层级文件属性动态解析 (Multi-level File Attributes)', () => {
    it('should resolve a 2-level file attribute directly (e.g., file.size)', () => {
      // 在本地模拟将一个文件对象塞入 Pool
      const fileSelector: Selector = { nodeId: 'node_1', path: ['myFile'] };
      pool.add(fileSelector, mockFileSegment);

      // 尝试读取衍生路径：myFile.size
      const attrSelector: Selector = { nodeId: 'node_1', path: ['myFile', 'size' as FileAttribute.SIZE] };
      const result = pool.get(attrSelector) as NumberSegment;

      expect(result).toBeDefined();
      // 验证是否通过 FileHelper 间接拿到了 1048576 字节
      expect(result?.value).toBe(1048576);
    });

    it('should support multi-level nested paths for file attributes (e.g., group.subGroup.file.name)', () => {
      // 测试多层嵌套情况
      const nestedFileSelector: Selector = {
        nodeId: 'node_1',
        path: ['group', 'subGroup', 'targetFile']
      };
      pool.add(nestedFileSelector, mockFileSegment);

      // 衍生路径深达 4 层
      const targetSelector: Selector = {
        nodeId: 'node_1',
        path: ['group', 'subGroup', 'targetFile', 'name']
      };
      const result = pool.get(targetSelector) as StringSegment;

      expect(result).toBeDefined();
      expect(result?.value).toBe('avatar.png');
    });
  });

  describe('递归死循环与边界防护 (Infinite Loop & Edge Cases Protection)', () => {
    it('should return undefined and not crash (infinite loop) for invalid attributes', () => {
      const fileSelector: Selector = { nodeId: 'node_1', path: ['myFile'] };
      pool.add(fileSelector, mockFileSegment);

      // 后缀不是合法的文件属性枚举（普通未知属性对象）
      const invalidAttrSelector: Selector = {
        nodeId: 'node_1',
        path: ['myFile', 'not_a_real_file_attribute_123']
      };

      // 如果发生无限循环，这里会因 Call Stack Overflow 报错而挂掉
      const result = pool.get(invalidAttrSelector);
      expect(result).toBeUndefined();
    });

    it('should terminate cleanly when recursive reduction path length falls below 2', () => {
      // 模拟极端恶意输入：全是合法属性组成的链条，且在存储中根本不存在对应实体
      const evilSelector: Selector = {
        nodeId: 'node_1',
        path: ['size', 'size', 'size', 'size']
      };

      // 核心安全测试：必须在 path 长度递减到限界（< 2）时触发熔断，返回 undefined 而不发生死循环
      const result = pool.get(evilSelector);
      expect(result).toBeUndefined();
    });

    it('should return undefined if the parent path exists but is not a FILE type', () => {
      // 如果父级变量存在，但是是个纯文本内容
      const textSelector: Selector = { nodeId: 'node_1', path: ['ordinaryObject'] };
      pool.add(textSelector, mockTextSegment);

      // 哪怕它的后缀假装在读取 size 属性
      const fakeAttrSelector: Selector = {
        nodeId: 'node_1',
        path: ['ordinaryObject', 'size']
      };

      const result = pool.get(fakeAttrSelector);
      // 它不应该去调用 FileHelper，而是识别到非 FILE 类型后安全返回 undefined
      expect(result).toBeUndefined();
    });
  });
});