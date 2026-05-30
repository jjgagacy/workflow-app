const translation = {
  nodes: {
    base: {
      name: 'Base',
      description: 'Basic node with no specific function'
    },
    if: {
      name: 'If',
      description: 'Conditional branching'
    },
    switch: {
      name: 'Switch',
      description: 'Multiple condition routing'
    },
    iteration: {
      name: 'Iteration',
      description: 'Loop over items'
    },
    loop: {
      name: 'Loop',
      description: 'Loop with condition'
    },
    merge: {
      name: 'Merge',
      description: 'Merge multiple branches'
    },
    filter: {
      name: 'Filter',
      description: 'Filter items based on condition'
    },
    code: {
      name: 'Code',
      description: 'Execute custom code'
    },
    'template-transform': {
      name: 'Template Transform',
      description: 'Transform data using templates'
    },
    'variable-assigner': {
      name: 'Variable Assigner',
      description: 'Assign values to variables'
    },
    'variable-aggregator': {
      name: 'Variable Aggregator',
      description: 'Aggregate multiple variables into one'
    },
    'parameter-extractor': {
      name: 'Parameter Extractor',
      description: 'Extract parameters from input'
    },
    'question-classifier': {
      name: 'Question Classifier',
      description: 'Classify questions into categories'
    },
    'document-extractor': {
      name: 'Document Extractor',
      description: 'Extract information from documents'
    },
    'list-operator': {
      name: 'List Operator',
      description: 'Perform operations on lists'
    },
    agent: {
      name: 'Agent',
      description: 'Agent node for decision making'
    },
    llm: {
      name: 'LLM',
      description: 'Large Language Model node'
    },
    openai: {
      name: 'OpenAI',
      description: 'GPT models'
    },
    anthropic: {
      name: 'Anthropic',
      description: 'Claude models'
    },
    'vector-store': {
      name: 'Vector Store',
      description: 'Vector database operations'
    },
    slack: {
      name: 'Slack',
      description: 'Send messages to Slack'
    },
    github: {
      name: 'GitHub',
      description: 'GitHub operations'
    },
    'google-sheets': {
      name: 'Google Sheets',
      description: 'Spreadsheet operations'
    },
    webhook: {
      name: 'Webhook',
      description: 'Receive HTTP requests'
    },
    schedule: {
      name: 'Schedule',
      description: 'Scheduled triggers'
    },
    'http-request': {
      name: 'HTTP Request',
      description: 'Make HTTP requests'
    },
    'knowledge-retrieval': {
      name: 'Knowledge Retrieval',
      description: 'Retrieve information from knowledge base'
    }
  },
  sections: {
    basic: 'Basic',
    'flow-control': 'Flow Control',
    data: 'Data',
    ai: 'AI',
    communication: 'Communication',
    development: 'Development',
    productivity: 'Productivity',
    triggers: 'Triggers',
    network: 'Network',
    knowledge: 'Knowledge'
  },
  'note-node': {
    placeholder: 'Enter note content here...',
    command: {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      strikethrough: 'Strikethrough',
      link: 'Link',
      'bulleted-list': 'Bulleted List'
    }
  },
  contextMenu: {
    addNode: 'Add Node',
    addNote: 'Add Note',
    paste: 'Paste',
    run: 'Run',
    tidyUpFlow: 'Tidy up flow',
    selectAll: 'Select All',
    unselectAll: 'Unselect all'
  },
  nodeMenu: {
    open: 'Open',
    replace: 'Replace',
    copy: 'Copy',
    deactivate: 'Deactivate',
    delete: 'Delete'
  },
  selectionMenu: {
    copy: 'Copy',
    tidyUp: 'Tidy up selection',
    selectAll: 'Select All',
    clearSelection: 'Clear Selection',
    deactivate: 'Deactivate',
    delete: 'Delete'
  },
  control: {
    addNode: 'Add Node',
    addNote: 'Add Note',
    pointerMode: 'Pointer Mode',
    handMode: 'Hand Mode',
    tidyNodes: 'Tidy Nodes',
    run: 'Run',
    searchCommand: 'Search Command',
    copy: 'Copy',
    duplicate: 'Duplicate',
    delete: 'Delete'
  },
  operator: {
    'string eq': 'Equals',
    'string not_eq': 'Does not equal',
    'string contains': 'Contains',
    'string not_contains': 'Does not contain',
    'string starts_with': 'Starts with',
    'string ends_with': 'Ends with',
    'string is_empty': 'Is empty',
    'string is_not_empty': 'Is not empty',
    'number eq': 'Equals',
    'number not_eq': 'Does not equal',
    'number gt': 'Greater than',
    'number gte': 'Greater than or equal to',
    'number lt': 'Less than',
    'number lte': 'Less than or equal to',
    'number is_empty': 'Is empty',
    'number is_not_empty': 'Is not empty',
    'boolean is_true': 'Is true',
    'boolean is_false': 'Is false',
    'boolean eq': 'Equals',
    'boolean not_eq': 'Does not equal',
    'array contains': 'Contains',
    'array not_contains': 'Does not contain',
    'array is_empty': 'Is empty',
    'array is_not_empty': 'Is not empty',
    'object has_key': 'Has key',
    'object not_has_key': 'Does not have key',
    'object is_empty': 'Is empty',
    'object is_not_empty': 'Is not empty',
    'any eq': 'Equals',
    'any not_eq': 'Does not equal',
    'any is_empty': 'Is empty',
    'any is_not_empty': 'Is not empty',
    'file name_contains': 'File name contains',
    'file is_empty': 'Is empty',
    'file is_not_empty': 'Is not empty'
  },
  conditions: {
    branchLogic: 'Branch logic',
    branchLogicDescription: 'Branches run top to bottom. The last one is the fallback path.',
    decisionBranchCount_one: '{{count}} decision branch',
    decisionBranchCount_other: '{{count}} decision branches',
    outputHandleCount_one: '{{count}} output handle',
    outputHandleCount_other: '{{count}} output handles',
    addBranchBeforeElse: 'Add branch before else',
    defaultBranchDescription: 'Runs when nothing above matches.',
    branchDescription: 'Runs when this branch matches.',
    moveBranchUp: 'Move branch up',
    moveBranchDown: 'Move branch down',
    removeBranch: 'Remove branch',
    toggleBranchLogic: 'Toggle branch logic, current {{logic}}',
    noConditionsYet: 'No conditions',
    conditionCount_one: '{{count}} condition',
    conditionCount_other: '{{count}} conditions',
    fallbackPath: 'Fallback path.',
    logicSummary: '{{logic}} group.',
    selectVariable: 'Select a variable',
    currentValue: 'Current value',
    conditionLabel: 'Condition {{index}}',
    removeCondition: 'Remove condition',
    type: 'Type',
    leftVariable: 'Left variable',
    operator: 'Operator',
    rightValue: 'Right value',
    rightValuePlaceholder: 'e.g. approved',
    unaryOperatorHint: 'This operator does not need a right value.',
    addCondition: 'Add condition',
    noConditionsFallback: 'Anything unmatched above goes to this output.',
    variableGroups: {
      environment: 'Environment',
      session: 'Session',
      builtIn: 'Built-in',
      nodeOutputs: 'Node outputs'
    },
    builtIns: {
      workflowInput: 'Workflow input',
      currentUser: 'Current user',
      currentTime: 'Current time'
    }
  }
};

export default translation;