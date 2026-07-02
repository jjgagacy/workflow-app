const translation = {
  nodes: {
    base: {
      name: 'Base',
      description: 'Basic node with no specific function',
      'no-select-model': 'No model selected',
      'llm-select-label': 'LLM',
      'input-variable-label': 'Input Variable',
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
      description: 'Execute custom code',
      in: 'In',
      out: 'Out',
      description2: 'Manage input variable mapping, output variable definition, and code exception handling strategy.',
      input_variable: 'Input Variable',
      add: 'Add',
      no_input_parameters: 'No input parameters',
      delete_input_parameter: 'Delete input parameter'
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
      variable: 'Variable',
      name: 'Variable Aggregator',
      description: 'Aggregate multiple variables into one',
      merged: 'Merged',
      output: 'Output',
      variable_list: 'Variable List',
      output_variable: 'Output Variable',
      add_variable: 'Add Variable',
      no_variables: 'No aggregated variables yet. Click the button above to add.',
      delete_variable: 'Delete Variable'
    },
    'parameter-extractor': {
      name: 'Parameter Extractor',
      description: 'Extract parameters from input',
      parameters: 'Parameters',
      output_variable: 'Output Variable',
      add_parameter: 'Add Parameter',
      no_parameters: 'No parameters yet. Click the button above to add.',
      delete_parameter: 'Delete Parameter',
      vision: 'Vision',
      no_vision: 'No Vision',
      no_modal: 'No model selected',
      remove_parameter: 'Remove Parameter',
      parameter_name: 'Parameter Name',
      parameter_name_placeholder: 'Enter parameter name',
      parameter_type: 'Parameter Type',
      parameter_label: 'Parameter {{index}}',
      remove_parameter_aria_label: 'Remove Parameter',
      parameter_description_required: 'Parameter description is required',
      'default-output-variable-name': 'extractedParameters'
    },
    'question-classifier': {
      name: 'Question Classifier',
      description: 'Classify questions into categories',
      'no-setting-category-prompt': 'No category prompt set',
      description2: 'Use a large model to classify input questions and route the results to the corresponding category branches.',
      'category-count': 'categories {{count}}',
      'category-list': 'Category List',
      'add-category': 'Add Category',
      'category-name': 'Category Name',
      'category-prompt': 'Category Prompt',
      'category': 'Category {{index}}',
      'remove-category-aria-label': 'Remove Category {{index}}',
      'category-prompt-placeholder': 'Enter category prompt, e.g., classify to this category when the user question contains refund, return, or cancel order related intent.'
    },
    'document-extractor': {
      name: 'Document Extractor',
      description: 'Extract information from documents',
      'no-input': 'No input variable',
      'input-variable-description': 'Only file or file array type variables (file / file[]) can be selected.',
      'output-variable': 'Output Variable',
      'input-variable': 'Input Variable',
    },
    'list-operator': {
      name: 'List Operator',
      description: 'Perform operations on lists',
      'no-input-variable': 'No input variable',
      input: 'Input',
      output: 'Output',
      descriptions: 'Perform filtering, slicing, and sorting operations on array variables.',
      operators: {
        contains: 'Contains',
        not_contains: 'Does not contain',
        equals: 'Equals',
        not_equals: 'Does not equal',
        starts_with: 'Starts with',
        ends_with: 'Ends with',
        is_empty: 'Is empty',
        is_not_empty: 'Is not empty'
      },
      logical: {
        and: 'AND',
        or: 'OR'
      },
      sort: {
        asc: 'Ascending',
        desc: 'Descending'
      },
      toggleBranchLogic: 'Toggle branch logic, current {{logic}}',
      noCondition: 'No conditions yet. Click the button above to add.',
      addCondition: 'Add Condition',
      filterConditions: 'Filter Conditions',
      condition: 'Condition',
      arrayVariable: 'Array Variable',
      removeCondition: 'Remove Condition',
      rightValuePlaceholder: 'e.g. approved',
      unaryOperatorHint: 'This operator does not require a right value.',
      firstN: 'First N',
      lastN: 'Last N',
      enableSort: 'Enable Sort',
      sortOrder: 'Sort Order',
      outputVariableName: 'Output Variable Name',
      noConditionsCallback: 'No conditions matched, this output will be used.',
    },
    agent: {
      name: 'Agent',
      description: 'Agent node for decision making'
    },
    llm: {
      name: 'LLM',
      description: 'Large Language Model node',
      visionEnabled: 'Vision Enabled',
      visionDisabled: 'Vision Disabled',
      retryOnFailure: 'Retry on Failure ({{count}} times / {{interval}}ms)',
      exceptionReturnDefault: 'Exception Handling: Return Default Value',
      exceptionStopExecution: 'Exception Handling: Stop Execution',
      description2: 'Select a model and configure prompts to generate text results for subsequent nodes.',
      model: 'Model',
      prompt: 'Prompt',
      systemPrompt: 'System Prompt',
      systemPromptPlaceholder: 'Define the role, boundaries, and style of the assistant.',
      userPrompt: 'User Prompt',
      userPromptPlaceholder: 'Enter the user prompt template, referencing the variables selected above.',
      assistantPrompt: 'Assistant Prompt',
      assistantPromptPlaceholder: 'Optional, provide example responses or additional guidance.',
      retryOnFailure2: 'Retry on Failure',
      retryOnFailureDescription: 'When enabled, the system will automatically retry when the LLM call fails, according to the configured count and interval.',
      maxRetryCount: 'Max Retry Count',
      retryInterval: 'Retry Interval (ms)',
      exceptionStrategy: 'Exception Strategy',
      visionAbility: 'Vision Ability',
      visionEnable: 'Enable Vision',
      visionDescription: 'When enabled, the LLM can process inputs that contain images.',
      exceptionHandling: 'Exception Handling',
      defaultReturnValue: 'Default Return Value',
      defaultReturnValuePlaceholder: 'e.g. {} or null',
      exceptionHandle: 'Exception Handling',
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
      description: 'Make HTTP requests',
      output: 'Output',
      retry: 'Retry',
      noRetry: 'No Retry',
      bodyType: {
        none: 'none',
        formData: 'form-data',
        urlencoded: 'x-www-form-urlencoded',
        json: 'json',
        raw: 'raw',
        binary: 'binary'
      },
      exceptionStrategy: {
        stopExecution: {
          name: 'Stop execution',
          description: 'Stop the current run immediately when the request fails.'
        },
        returnDefault: {
          name: 'Return default value',
          description: 'Return the configured default value when the request fails.'
        }
      },
      description2: 'Configure the request URL, body, and timeout strategy, make an HTTP call, and output the result.',
      requestConfig: 'Request Config',
      url: 'URL',
      method: 'Method',
      headers: 'Headers',
      addHeader: 'Add Header',
      params: 'Params',
      addParam: 'Add Param',
      deleteHeader: 'Delete Header',
      deleteParam: 'Delete Param',
      requestBody: 'Request Body',
      formData: 'Form Data',
      urlEncoded: 'Url Encoded',
      addField: 'Add Field',
      bodyContent: 'Body Content',
      binaryVariable: 'Binary Variable',
      timeoutSettings: 'Timeout Settings (ms)',
      timeoutConnect: 'Timeout Connect',
      timeoutRead: 'Timeout Read',
      timeoutWrite: 'Timeout Write',
      retrySettings: 'Retry Settings',
      retrySettingsDescription: 'Configure the retry strategy when the request fails.',
      retryOnFailure: 'Retry on Failure',
      retryOnFailureDescription: 'When enabled, the system will automatically retry when the request fails.',
      maxRetryCount: 'Max Retry Count',
      retryCountUnit: 'times',
      retryInterval: 'Retry Interval',
      retryIntervalUnit: 'ms',
      exceptionHandler: 'Exception Handler',
      returnDefaultValue: 'Return Default Value',
      outputVariableName: 'Output Variable Name',
    },
    'knowledge-retrieval': {
      name: 'Knowledge Retrieval',
      description: 'Retrieve information from knowledge base',
      input: 'Input',
      knowledgeBases: 'Knowledge Bases',
      output: 'Output',
      noInputVariable: 'No input variable selected',
      noKnowledgeBase: 'No knowledge base selected',
      noKnowledgeBaseSelected: 'No knowledge base selected',
      noKnowledgeBaseAvailable: 'No knowledge base available',
      noKnowledgeBaseConfigured: 'No knowledge base configured',
      noKnowledgeBaseConfiguredDescription: 'Please configure a knowledge base in the settings before using this node.',
      noKnowledgeBaseAvailableDescription: 'There are no available knowledge bases. Please create one in the settings.',
      description2: 'Retrieve relevant content from one or more knowledge bases and output the results for subsequent nodes to use.',
      addKnowledgeBase: 'Add Knowledge Base',
      removeKnowledgeBase: 'Remove Knowledge Base',
      knowledgeBase: 'Knowledge Base',
      outputVariableName: 'Output Variable Name',
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
    },
    default: 'Default',
    condition: 'Condition',
  },
  iteration: {
    parallel: 'Parallel',
    stop: 'Stop',
    flat: 'Flat',
    nested: 'Nested',
    parallelCount: 'Parallel Count',
    parallelCountDescription: 'Controls the number of iterations that can run simultaneously. Default is 1.',
    errorResponse: 'Error Response',
    errorResponseDescription: 'Choose how to handle errors during iteration execution.',
    flatDescription: 'When enabled, the results of each iteration will be merged into a flat array output.',
  },
  errorHandler: {
    exceptionStrategy: 'Exception Strategy',
    exceptionStrategyDescription: 'Choose how to handle exceptions during code execution.',
    stopExecution: 'Stop Execution',
    stopExecutionDesc: 'Immediately stop the current execution when an exception occurs.',
    returnDefault: 'Return Default Value',
    returnDefaultDesc: 'Return a default value when an exception occurs.',
    placeholder: 'e.g. {} or null'
  },
  retryConfig: {
    enable: 'Enable Retry',
    times: 'times',
    retryOnFailure: 'Retry on Failure',
    retryOnFailureDesc: 'When enabled, the system will automatically retry when code execution fails.',
    maxRetryCount: 'Max Retry',
    maxRetryCountDesc: 'The maximum number of times to retry when code execution fails.',
  }
};

export default translation;