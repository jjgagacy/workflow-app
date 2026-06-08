export const EDITOR_MIN_HEIGHT = 150;

export const CUSTOM_THEMES = {
  light: {
    base: 'vs' as const,
    inherit: true,
    rules: [
      // 注释
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'comment.line', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'comment.block', foreground: '6a9955', fontStyle: 'italic' },

      // 关键字
      { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '0000ff', fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: '0000ff' },

      // 字符串
      { token: 'string', foreground: 'a31515' },
      { token: 'string.quote', foreground: 'a31515' },
      { token: 'string.template', foreground: 'a31515' },

      // 数字
      { token: 'number', foreground: '098658' },
      { token: 'number.hex', foreground: '098658' },
      { token: 'number.float', foreground: '098658' },

      // 函数
      { token: 'function', foreground: '795e26' },
      { token: 'function.declaration', foreground: '795e26', fontStyle: 'bold' },

      // 类
      { token: 'class', foreground: '267f99' },
      { token: 'class.name', foreground: '267f99', fontStyle: 'bold' },

      // 变量
      { token: 'variable', foreground: '001080' },
      { token: 'variable.parameter', foreground: '001080' },

      // 类型
      { token: 'type', foreground: '267f99' },
      { token: 'type.identifier', foreground: '267f99' },

      // 运算符
      { token: 'operator', foreground: '000000' },

      // 正则表达式
      { token: 'regexp', foreground: '811f3f' },

      // 标签
      { token: 'tag', foreground: '800000' },
      { token: 'tag.html', foreground: '800000' },

      // 属性
      { token: 'attribute.name', foreground: 'ff0000' },
      { token: 'attribute.value', foreground: '0451a5' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#000000',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editor.selectionBackground': '#add6ff',
      'editor.inactiveSelectionBackground': '#e5ebf1',
      'editor.wordHighlightBackground': '#b4d7ff',
      'editor.wordHighlightStrongBackground': '#d2e3ff',
      'editorBracketMatch.background': '#0066ff20',
      'editorBracketMatch.border': '#0066ff',
      'editorIndentGuide.background': '#d3d3d3',
      'editorIndentGuide.activeBackground': '#939393',
    }
  },
  dark: {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
      // 注释
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'comment.line', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'comment.block', foreground: '6a9955', fontStyle: 'italic' },

      // 关键字
      { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: '569cd6' },

      // 字符串
      { token: 'string', foreground: 'ce9178' },
      { token: 'string.quote', foreground: 'ce9178' },
      { token: 'string.template', foreground: 'ce9178' },

      // 数字
      { token: 'number', foreground: 'b5cea8' },
      { token: 'number.hex', foreground: 'b5cea8' },
      { token: 'number.float', foreground: 'b5cea8' },

      // 函数
      { token: 'function', foreground: 'dcdcaa' },
      { token: 'function.declaration', foreground: 'dcdcaa', fontStyle: 'bold' },

      // 类
      { token: 'class', foreground: '4ec9b0' },
      { token: 'class.name', foreground: '4ec9b0', fontStyle: 'bold' },

      // 变量
      { token: 'variable', foreground: '9cdcfe' },
      { token: 'variable.parameter', foreground: '9cdcfe' },

      // 类型
      { token: 'type', foreground: '4ec9b0' },
      { token: 'type.identifier', foreground: '4ec9b0' },

      // 运算符
      { token: 'operator', foreground: 'd4d4d4' },

      // 正则表达式
      { token: 'regexp', foreground: 'd16969' },

      // 标签
      { token: 'tag', foreground: '808080' },
      { token: 'tag.html', foreground: '808080' },

      // 属性
      { token: 'attribute.name', foreground: '9cdcfe' },
      { token: 'attribute.value', foreground: 'ce9178' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editor.wordHighlightBackground': '#2a2a2a',
      'editor.wordHighlightStrongBackground': '#2a2a2a',
      'editorBracketMatch.background': '#0066ff20',
      'editorBracketMatch.border': '#0066ff',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
    }
  }
};