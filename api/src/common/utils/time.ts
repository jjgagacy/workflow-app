/**
 * 将数字补齐为2位字符串（不足两位前面补0）
 * @param num 要格式化的数字
 * @returns 补齐后的2位数字字符串
 * @example
 * pad2Digits(5) => "05"
 * pad2Digits(12) => "12"
 */
function pad2Digits(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * 为日期字符串补齐时间部分（如果没有时间部分）
 * @param timeString 日期时间字符串，格式为YYYY-MM-DD或YYYY-MM-DD HH:MM:SS
 * @returns 补齐后的完整日期时间字符串（YYYY-MM-DD HH:MM:SS格式）
 * @example 
 * padTime("2023-05-15") => "2023-05-15 00:00:00"
 * padTime("2023-05-15 14:30:00") => "2023-05-15 14:30:00"
 */
function padTime(timeString: string): string {
  if (timeString.length === 10) {
    return `${timeString} 00:00:00`;
  }
  return timeString;
}

/**
 * 将Date对象格式化为YYYY-MM-DD HH:MM:SS格式的字符串
 * @param date 要格式化的Date对象
 * @returns 格式化后的日期时间字符串
 * @example
 * formatDate(new Date()) => "2023-05-15 14:30:00"
 */
export function formatDate(date: Date) {
  return (
    [
      date.getFullYear(),
      pad2Digits(date.getMonth() + 1),
      pad2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      pad2Digits(date.getHours()),
      pad2Digits(date.getMinutes()),
      pad2Digits(date.getSeconds()),
    ].join(':')
  );
}

/**
 * 验证日期字符串是否有效（YYYY-MM-DD格式）
 * @param dateString 要验证的日期字符串
 * @returns 返回布尔值，true表示有效日期，false表示无效
 * @example
 * dateValid("2023-05-15") => true
 * dateValid("2023-13-01") => false
 */
function dateValid(dateString: string): boolean {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}

/**
 * 解析日期字符串为Date对象
 * @param dateString 要解析的日期字符串（YYYY-MM-DD格式）
 * @returns 成功返回Date对象，失败返回null
 * @example
 * parseDate("2023-05-15") => Date对象
 * parseDate("invalid-date") => null
 */
export function parseDate(dateString: string): Date | null {
  if (dateValid(dateString)) {
    return new Date(dateString);
  }
  return null;
}

/**
 * 解析日期时间字符串为Date对象
 * @param dateTimeString 要解析的日期时间字符串（ISO 8601格式）
 * @returns 成功返回Date对象，失败返回null
 * @example
 * parseDateTime("2023-05-15T14:30:00Z") => Date对象
 * parseDateTime("invalid-datetime") => null
 */
export function parseDateTime(dateTimeString: string): Date | null {
  if (dateTimeValid(dateTimeString)) {
    return new Date(dateTimeString);
  }
  return null;
}

/**
 * 验证ISO 8601格式的日期时间字符串是否有效
 * 
 * @param dateTimeString 要验证的日期时间字符串，格式为 YYYY-MM-DDTHH:MM:SS.sssZ
 *   - YYYY-MM-DD: 日期部分（年-月-日）
 *   - T: 日期和时间分隔符
 *   - HH:MM:SS: 时间部分（时:分:秒）
 *   - .sss: 可选的毫秒部分（1-3位数字）
 *   - Z: 表示UTC时区
 * 
 * @returns 返回验证结果：
 *   - true: 字符串符合ISO 8601格式且是合法日期时间
 *   - false: 字符串格式无效或日期不合法
 * 
 * @example
 * // 返回 true
 * dateTimeValid('2023-05-15T14:30:00Z');
 * dateTimeValid('2023-05-15T14:30:00.123Z');
 * 
 * // 返回 false
 * dateTimeValid('2023-05-15 14:30:00'); // 缺少T和Z
 * dateTimeValid('2023-05-15T14:30:00.1234Z'); // 毫秒超过3位
 * dateTimeValid('2023-13-01T14:30:00Z'); // 无效日期（13月）
 */
function dateTimeValid(dateTimeString: string): boolean {
  const regEx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
  if (!dateTimeString.match(regEx)) return false; // Invalid format
  const d = new Date(dateTimeString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString() === dateTimeString;
}

/**
 * 验证时间字符串是否有效
 * @param timeString 要验证的时间字符串，格式为 YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS
 * @returns 返回布尔值，true 表示时间格式有效且是合法日期，false 表示无效
 */
function timeValid(timeString: string): boolean {
  const regEx = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
  if (!timeString.match(regEx)) return false; // Invalid format
  const d = new Date(padTime(timeString));
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return (
    formatDate(d) == timeString || formatDate(d) == `${timeString} 00:00:00`
  );
}

export function parseTime(timeString: string): Date | null {
  if (timeValid(timeString)) {
    return new Date(timeString);
  }
  return null;
}
