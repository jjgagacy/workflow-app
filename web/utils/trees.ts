export interface TreeNode {
  [key: string]: any;
  children?: TreeNode[];
  id?: string | number;
}

export interface TreeNodeOptions {
  idKey?: string;
  parentKey?: string;
  childrenKey?: string;
  labelKey?: string;
  rootValue?: string | null | undefined;
  levelKey?: string;
  rootLevel?: number;
}

export interface FlattenNode {
  [key: string]: any;
  level: number;
  parentId: string | number | null;
}

/**
 * 将扁平数组转换为树形结构
 * 
 * @example
 * const flatArray = [
 *   { index: '1', name: 'Node 1', parent: '' },
 *   { index: '2', name: 'Node 2', parent: '1' },
 *   { index: '3', name: 'Node 3', parent: '1' },
 *   { index: '4', name: 'Node 4', parent: '2' }
 * ];
 * 
 * const tree = arrayToTree(flatArray, {
 *   idKey: 'index',
 *   parentKey: 'parent',
 *   rootValue: ''
 * });
 * 
 * /* 结果：
 * [
 *   {
 *     index: '1',
 *     name: 'Node 1',
 *     parent: '',
 *     children: [
 *       { 
 *         index: '2', 
 *         name: 'Node 2', 
 *         parent: '1', 
 *         children: [
 *           { index: '4', name: 'Node 4', parent: '2', children: [] }
 *         ] 
 *       },
 *       { index: '3', name: 'Node 3', parent: '1', children: [] }
 *     ]
 *   }
 * ]
 */
export function arrayToTree<T extends Record<string, any>>(
  array: T[],
  options: TreeNodeOptions = {}
): (T & { children: (T & TreeNode)[] })[] {
  // 合并默认配置
  const {
    idKey = 'id',
    parentKey = 'parentId',
    childrenKey = 'children',
    rootValue = ''
  } = options;

  // 创建节点映射表
  const nodeMap = new Map<string | number, T & TreeNode>();
  const tree: (T & TreeNode)[] = [];

  // 首先将所有节点存入映射表
  array.forEach(node => {
    const nodeId = node[idKey];
    if (nodeId === undefined || nodeId === null) {
      console.warn(`Node missing idKey "${idKey}":`, node);
      return;
    }
    nodeMap.set(nodeId, { ...node, [childrenKey]: [] });
  });

  // 构建树结构
  array.forEach(node => {
    const nodeId = node[idKey];
    const parentId = node[parentKey];

    if (parentId === rootValue || parentId === null || parentId === undefined) {
      // 根节点
      const treeNode = nodeMap.get(nodeId);
      if (treeNode) {
        tree.push(treeNode);
      }
    } else {
      // 找到父节点并添加到其children
      const parent = nodeMap.get(parentId);
      const currentNode = nodeMap.get(nodeId);
      
      if (parent && currentNode) {
        parent[childrenKey].push(currentNode);
      } else if (currentNode) {
        // 如果找不到父节点，作为根节点处理
        tree.push(currentNode);
      }
    }
  });

  // 保证所有节点的 children 属性都为数组（不为 undefined）
  function ensureChildrenArray(nodes: (T & TreeNode)[]) {
    nodes.forEach(node => {
      if (!Array.isArray(node[childrenKey])) {
        (node as any)[childrenKey] = [];
      }
      ensureChildrenArray(node[childrenKey]);
    });
  }
  ensureChildrenArray(tree);

  return tree as (T & { children: (T & TreeNode)[] })[];
}

// // 使用示例
// interface FlatNode {
//   index: string;
//   name: string;
//   parent: string;
//   [key: string]: any;
// }

// // 示例用法
// const flatArray: FlatNode[] = [
//   { index: '1', name: 'Node 1', parent: '' },
//   { index: '2', name: 'Node 2', parent: '1' },
//   { index: '3', name: 'Node 3', parent: '1' },
//   { index: '4', name: 'Node 4', parent: '2' }
// ];

// const tree = arrayToTree(flatArray, {
//   idKey: 'index',
//   parentKey: 'parent',
//   rootValue: ''
// });

// console.log(tree);


/**
 * 将树形数据迭代式扁平化，并添加层级信息
 * 
 * @example
 * const treeData = [
 *   {
 *     id: 1,
 *     name: 'Node 1',
 *     children: [
 *       {
 *         id: 2,
 *         name: 'Node 1.1',
 *         children: [
 *           { id: 3, name: 'Node 1.1.1' }
 *         ]
 *       },
 *       { id: 4, name: 'Node 1.2' }
 *     ]
 *   },
 *   {
 *     id: 5,
 *     name: 'Node 2'
 *   }
 * ];
 * 
 * const flattened = treeToFlatten(treeData, {
 *   idKey: 'id',
 *   parentKey: 'parentId',
 *   levelKey: 'level'
 * });
 * 
 * /* 结果：
 * [
 *   { id: 1, name: 'Node 1', level: 0, parentId: null },
 *   { id: 2, name: 'Node 1.1', level: 1, parentId: 1 },
 *   { id: 3, name: 'Node 1.1.1', level: 2, parentId: 2 },
 *   { id: 4, name: 'Node 1.2', level: 1, parentId: 1 },
 *   { id: 5, name: 'Node 2', level: 0, parentId: null }
 * ]
 */
export function treeToFlatten<T extends TreeNode>(
  tree: T | T[],
  options: TreeNodeOptions = {}
): (Omit<T, 'children'> & FlattenNode)[] {
  const {
    childrenKey = 'children',
    parentKey = 'parentId',
    levelKey = 'level',
    idKey = 'id',
    rootLevel = 0
  } = options;

  const result: (Omit<T, 'children'> & FlattenNode)[] = [];
  const stack: Array<{
    node: T;
    level: number;
    parentId: string | number | null;
  }> = [];

  // 处理单个节点的情况
  const treeArray = Array.isArray(tree) ? tree : [tree];

  // 初始节点入栈（逆序以保证顺序正确）
  for (let i = treeArray.length - 1; i >= 0; i--) {
    stack.push({
      node: treeArray[i],
      level: rootLevel,
      parentId: null
    });
  }

  while (stack.length > 0) {
    const { node, level, parentId } = stack.pop()!;

    // 创建扁平节点
    const flatNode: Omit<T, 'children'> & FlattenNode = {
      ...node,
      [levelKey]: level,
      [parentKey]: parentId,
      level,
      parentId
    } as Omit<T, 'children'> & FlattenNode;

    // 移除children属性
    if (childrenKey in flatNode) {
      delete flatNode[childrenKey];
    }

    result.push(flatNode);

    // 如果有子节点，逆序入栈以保证顺序正确
    const children = node[childrenKey] as T[] | undefined;
    if (children && children.length > 0) {
      const nodeId = node[idKey];
      if (nodeId === undefined || nodeId === null) {
        console.warn(`Node missing idKey "${idKey}":`, node);
        continue;
      }

      for (let i = children.length - 1; i >= 0; i--) {
        stack.push({
          node: children[i],
          level: level + 1,
          parentId: nodeId
        });
      }
    }
  }

  return result;
}

// // 使用示例
// interface ExampleNode {
//   id: number;
//   name: string;
//   children?: ExampleNode[];
//   extra?: string;
// }

// const treeData: ExampleNode[] = [
//   {
//     id: 1,
//     name: 'Node 1',
//     children: [
//       {
//         id: 2,
//         name: 'Node 1.1',
//         children: [
//           { id: 3, name: 'Node 1.1.1' }
//         ]
//       },
//       { id: 4, name: 'Node 1.2' }
//     ]
//   },
//   {
//     id: 5,
//     name: 'Node 2'
//   }
// ];

// // 使用默认配置
// const flattened1 = treeToFlatten(treeData);

/**
 * 深度复制部门树形结构
 * 
 * @example
 * const departments = [
 *   {
 *     id: 1,
 *     name: '技术部',
 *     children: [
 *       { id: 2, name: '前端组', children: [] },
 *       { id: 3, name: '后端组' }
 *     ]
 *   },
 *   { id: 4, name: '市场部' }
 * ];
 * 
 * const copied = deepCopyDepartments(departments);
 * // 返回深拷贝的部门树，修改 copied 不会影响原数据
 */
export function deepCopyTree<T extends { children?: T[] }>(nodes: T[]): T[] {
  return nodes.map(node => ({
    ...node,
    children: node.children ? deepCopyTree(node.children) : undefined
  }));
}

// 使用 JSON 序列化的深度拷贝（性能更好，但会丢失函数和特殊对象）
export function deepCopyDepartmentsJSON<T>(tree: T[]): T[] {
  return JSON.parse(JSON.stringify(tree));
}

// 更健壮的版本，处理各种边界情况
export function deepCopyTreeRobust(tree: TreeNode[]): TreeNode[] {
  if (!tree || !Array.isArray(tree)) {
    return [];
  }

  return tree.map(department => {
    if (typeof department !== 'object' || department === null) {
      return department;
    }

    const copied: TreeNode = { ...department };

    // 递归复制子节点
    if (Array.isArray(department.children)) {
      copied.children = deepCopyTreeRobust(department.children);
    } else if (department.children !== undefined) {
      // 处理非数组的 children（可能是 null 或 undefined）
      copied.children = department.children;
    }

    return copied;
  });
}
