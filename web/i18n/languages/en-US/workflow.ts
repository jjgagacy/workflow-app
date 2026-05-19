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
    placeholder: 'Enter note content here...'
  }
};

export default translation;