const translation = {
  nodes: {
    base: {
      name: '基础节点',
      description: '没有特定功能的基础节点'
    },
    if: {
      name: '条件判断',
      description: '条件分支判断'
    },
    switch: {
      name: '多路分支',
      description: '多条件路由'
    },
    iteration: {
      name: '迭代循环',
      description: '循环处理列表项'
    },
    loop: {
      name: '循环',
      description: '带条件的循环'
    },
    merge: {
      name: '合并',
      description: '合并多个分支'
    },
    filter: {
      name: '过滤器',
      description: '基于条件过滤数据项'
    },
    code: {
      name: '代码节点',
      description: '执行自定义代码'
    },
    'template-transform': {
      name: '模板转换',
      description: '使用模板转换数据'
    },
    'variable-assigner': {
      name: '变量赋值',
      description: '给变量赋值'
    },
    'variable-aggregator': {
      name: '变量聚合',
      description: '聚合多个变量为一个'
    },
    'parameter-extractor': {
      name: '参数提取器',
      description: '从输入中提取参数'
    },
    'question-classifier': {
      name: '问题分类器',
      description: '将问题分类到不同类别'
    },
    'document-extractor': {
      name: '文档提取器',
      description: '从文档中提取信息'
    },
    'list-operator': {
      name: '列表操作器',
      description: '对列表执行操作'
    },
    agent: {
      name: '智能代理',
      description: '用于决策的代理节点'
    },
    llm: {
      name: '大语言模型',
      description: '大语言模型节点'
    },
    openai: {
      name: 'OpenAI',
      description: 'GPT 模型'
    },
    anthropic: {
      name: 'Anthropic',
      description: 'Claude 模型'
    },
    'vector-store': {
      name: '向量数据库',
      description: '向量数据库操作'
    },
    slack: {
      name: 'Slack',
      description: '发送消息到 Slack'
    },
    github: {
      name: 'GitHub',
      description: 'GitHub 操作'
    },
    'google-sheets': {
      name: 'Google Sheets',
      description: '电子表格操作'
    },
    webhook: {
      name: 'Webhook',
      description: '接收 HTTP 请求'
    },
    schedule: {
      name: '定时任务',
      description: '定时触发器'
    },
    'http-request': {
      name: 'HTTP 请求',
      description: '发起 HTTP 请求'
    },
    'knowledge-retrieval': {
      name: '知识检索',
      description: '从知识库中检索信息'
    }
  },
  sections: {
    basic: '基础',
    'flow-control': '流程控制',
    data: '数据处理',
    ai: 'AI',
    communication: '通讯',
    development: '开发',
    productivity: '生产力',
    triggers: '触发器',
    network: '网络',
    knowledge: '知识库'
  },
  'note-node': {
    placeholder: '在此输入备注内容...',
    command: {
      bold: '加粗',
      italic: '斜体',
      underline: '下划线',
      strikethrough: '删除线',
      link: '链接',
      'bulleted-list': '无序列表'
    }
  },
  contextMenu: {
    addNode: '添加节点',
    addNote: '添加备注',
    paste: '粘贴',
    run: '运行',
    tidyUpFlow: '整理节点',
    selectAll: '全选',
    unselectAll: '取消全选'
  },
  nodeMenu: {
    open: '打开',
    replace: '替换',
    copy: '复制',
    deactivate: '停用',
    delete: '删除'
  },
  selectionMenu: {
    copy: '复制',
    tidyUpSelection: '整理选择',
    selectAll: '全选',
    clearSelection: '清除选择',
    deactivate: '停用',
    delete: '删除'
  },
  control: {
    addNode: '添加节点',
    addNote: '添加备注',
    pointerMode: '指针模式',
    handMode: '抓手模式',
    tidyNodes: '整理节点',
    run: '运行',
    searchCommand: '搜索命令',
    copy: '拷贝',
    duplicate: '复制',
    delete: '删除',
  },
  operator: {
    xx: 'xxxx谢谢',
    'string eq': '等于',
    'string not_eq': '不等于',
    'string contains': '包含',
    'string not_contains': '不包含',
    'string starts_with': '开头是',
    'string ends_with': '结尾是',
    'string is_empty': '为空',
    'string is_not_empty': '不为空',
    'number eq': '等于',
    'number not_eq': '不等于',
    'number gt': '大于',
    'number gte': '大于等于',
    'number lt': '小于',
    'number lte': '小于等于',
    'number is_empty': '为空',
    'number is_not_empty': '不为空',
    'boolean is_true': '为 true',
    'boolean is_false': '为 false',
    'boolean eq': '等于',
    'boolean not_eq': '不等于',
    'array contains': '包含',
    'array not_contains': '不包含',
    'array is_empty': '为空',
    'array is_not_empty': '不为空',
    'object has_key': '存在字段',
    'object not_has_key': '不存在字段',
    'object is_empty': '为空',
    'object is_not_empty': '不为空',
    'any eq': '等于',
    'any not_eq': '不等于',
    'any is_empty': '为空',
    'any is_not_empty': '不为空',
    'file name_contains': '文件名包含',
    'file is_empty': '为空',
    'file is_not_empty': '不为空'
  },
};

export default translation;