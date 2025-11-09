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

// src/utils/date.util.ts
export function toISOWithOffset(date: Date, timeZone: string): string {
  // 使用 Intl 拆分时区对应的年月日时分秒（不含毫秒）
  const dtf = new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';

  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const second = Number(get('second'));

  // 把上面的时分秒当作目标时区的“本地时间”，用 Date.UTC 构造对应的 UTC 毫秒数
  // 注意：使用 date.getMilliseconds() 保留原始毫秒精度
  const ms = date.getMilliseconds();
  const tzLocalAsUTCms = Date.UTC(year, month - 1, day, hour, minute, second, ms);

  // 原始时间（UTC ms）
  const utcMs = date.getTime();

  // 偏移（以毫秒计）
  const offsetMs = tzLocalAsUTCms - utcMs;

  // 把偏移四舍五入到最近的整分钟，避免出现 +07:59 这类微小误差
  const offsetMinExact = offsetMs / 60000;
  const offsetMinRounded = Math.round(offsetMinExact);

  const sign = offsetMinRounded >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMinRounded);
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
  const hh = pad(Math.floor(absMin / 60));
  const mm = pad(absMin % 60);

  const msStr = String(ms).padStart(3, '0');
  const yearStr = String(year).padStart(4, '0');
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  const secondStr = String(second).padStart(2, '0');

  return `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}.${msStr}${sign}${hh}:${mm}`;
}
