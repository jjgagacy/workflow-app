/**
 * 安全格式化用户名，正确处理Unicode字符（如中文）
 * @param username 原始用户名
 * @param visibleChars 显示的前几个字符，默认2
 * @returns 格式化后的用户名
 */
export function maskUsernameSafely(
  username: string,
  visibleChars: number = 2
): string {
  if (!username) return '';

  // 使用扩展运算符处理Unicode字符（如emoji、中文）
  const chars = [...username];

  if (chars.length < visibleChars) {
    return username;
  }

  const visiblePart = chars.slice(0, visibleChars).join('');
  const hiddenPart = '*'.repeat(chars.length - visibleChars);

  return visiblePart + hiddenPart;
}

interface MaskMobileOptions {
  maskChars?: string;
  maskLength?: number;
  keepPrefix?: number;
  keepSuffix?: number;
}

export function maskMobileSafely(
  mobile: string | number,
  options: MaskMobileOptions = {}
): string {
  const {
    maskChars = '*',
    maskLength = 4,
    keepPrefix = 3,
    keepSuffix = 2,
  } = options;

  const mobileStr = String(mobile || '');
  const cleanMobile = mobileStr.replace(/\D/g, '');

  const totalLength = keepPrefix + maskLength + keepSuffix;
  if (cleanMobile.length < totalLength) {
    // 如果手机号太短，返回部分屏蔽
    if (cleanMobile.length <= keepPrefix + keepSuffix) {
      return cleanMobile;
    }
    const actualMaskLength = cleanMobile.length - keepSuffix - keepPrefix;
    const prefix = cleanMobile.substring(0, keepPrefix);
    const suffix = cleanMobile.substring(cleanMobile.length - keepPrefix);
    const mask = maskChars.repeat(Math.max(actualMaskLength, 0));
    return prefix + mask + suffix;
  }

  // 标准情况
  const prefix = cleanMobile.substring(0, keepPrefix);
  const suffix = cleanMobile.substring(cleanMobile.length - keepSuffix);
  const mask = maskChars.repeat(maskLength);
  return prefix + mask + suffix;
}


