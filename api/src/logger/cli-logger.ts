import { LoggerService } from '@nestjs/common';

export class CliLogger implements LoggerService {
  log(message: any, context?: string) {
    // CLI 模式下只显示错误
    if (context === 'GlobalLogger') {
      // 过滤掉 GlobalLogger 的日志
      return;
    }
    // 只输出关键信息
    if (context === 'I18nService' && message.includes('No changes detected')) {
      return;
    }
    // 只显示错误级别
    console.log(`[${context}] ${message}`);
  }
  error(message: any, trace?: string, context?: string) {
    console.error(`❌ [${context}] ${message}`);
  }
  warn(message: any, context?: string) {
    // CLI 模式不显示警告
  }
  debug(message: any, context?: string) {
    // 不显示调试信息
  }
  verbose(message: any, context?: string) {
    // 不显示详细信息
  }
}