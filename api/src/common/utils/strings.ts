/**
 * 检查字符串是否为非空值（非undefined且非空字符串）
 * @param str 要检查的字符串
 * @returns 返回布尔值：
 *   - true: 字符串有值且不为空字符串
 *   - false: 字符串为undefined或空字符串
 * @example
 * notEmpty("hello") => true
 * notEmpty("") => false
 * notEmpty(undefined) => false
 * notEmpty(null) => false (注意：null也会返回false)
 */
function notEmpty(str: any) {
  return str !== undefined && str !== '';
}

/**
 * 验证ID是否有效（正数）
 * @param id 要验证的ID值
 * @returns 返回布尔值：
 *   - true: ID是有效的正数
 *   - false: ID不是数字、不是正数或未定义
 * @example
 * validId(1) => true
 * validId(0) => false
 * validId(-1) => false
 * validId("1") => false
 * validId(undefined) => false
 */
function validId(id: any) {
  return id !== undefined && typeof id === 'number' && id > 0;
}

/**
 * 验证数值是否有效（任何数字，包括0和负数）
 * @param numVal 要验证的数值
 * @returns 返回布尔值：
 *   - true: 值是有效的数字（包括0和负数）
 *   - false: 值不是数字或未定义
 * @example
 * validNumber(0) => true
 * validNumber(-1) => true
 * validNumber(3.14) => true
 * validNumber("123") => false
 * validNumber(undefined) => false
 */
function validNumber(intVal: any) {
  return intVal !== undefined && typeof intVal === 'number';
}

export { notEmpty, validId, validNumber };
