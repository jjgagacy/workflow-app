const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

// 反向映射（用于 unescape）
const htmlUnescapes: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'"
};

// 正则表达式：匹配需要转义的字符
const reUnescapedHtml = /[&<>"']/g;
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

export function escape(string: string): string {
  // 1. 非字符串处理
  if (!string || typeof string !== 'string') {
    return '';
  }

  // 2. 性能优化：如果没有需要转义的字符，直接返回原字符串
  if (!reHasUnescapedHtml.test(string)) {
    return string;
  }

  // 3. 替换所有需要转义的字符
  return string.replace(reUnescapedHtml, (chr) => htmlEscapes[chr]);
}