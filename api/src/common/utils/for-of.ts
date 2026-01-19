interface ForOfCheckResult {
  canUse: boolean;
  reason?: string;
  type?: string;
}

function checkForOfUse(content: any): ForOfCheckResult {
  if (content == null) {
    return {
      canUse: false,
      reason: "Content is null or undefined",
      type: typeof content,
    };
  }

  if (typeof content[Symbol.iterator] !== 'function') {
    return {
      canUse: false,
      reason: 'Content does not have Symbol.iteratior method',
      type: Object.prototype.toString.call(content),
    };
  }

  try {
    const iterator = content[Symbol.iterator]();
    if (typeof iterator.next !== 'function') {
      return {
        canUse: false,
        reason: 'Iterator does not have next method',
        type: Object.prototype.toString.call(content),
      };
    }

    return {
      canUse: true,
      type: Object.prototype.toString.call(content),
    };
  } catch (error) {
    return {
      canUse: false,
      reason: `Iterator throw error: ${error}`,
      type: Object.prototype.toString.call(content),
    }
  }
}

export function safeForOf<T>(content: any, callback: (item: T, index: number) => void): void {
  const checkUseResult = checkForOfUse(content);
  if (!checkUseResult.canUse) {
    throw new Error(checkUseResult.reason);
  }

  let index = 0;
  for (const item of content) {
    callback(item as T, index++)
  }
}
