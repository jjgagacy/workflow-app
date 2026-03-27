import { resolve } from "path";
import { Event } from "../core/entities/event/writer-entities.js";

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const isLogToFile = true;

const __dirname = new URL('.', import.meta.url).pathname;

async function logToFile(logData: LogData) {
  const logLine = `[${new Date(logData.timestamp * 1000).toISOString()}] [${logData.level}] ${logData.message}\n`;
  // Append log line to file (synchronously for simplicity)
  // In production, consider using a proper logging library with async support and log rotation
  const fs = await import('fs');
  const logFilePath = resolve(__dirname, '../../storage/plugin.log');
  fs.appendFileSync(logFilePath, logLine);
}

logToFile({
  level: 'INFO',
  message: 'Logger initialized',
  timestamp: Date.now() / 1000,
}).catch(err => {
  console.error("Failed to write log to file:", err);
});

export interface LogData {
  level: LogLevel;
  message: string;
  timestamp: number;
}

function emitLog(logData: LogData) {
  if (isLogToFile) {
    logToFile(logData).catch(err => {
      console.error("Failed to write log to file:", err);
    });
  }
  process.stdout.write(
    JSON.stringify({
      event: Event.LOG,
      data: logData,
    }) + '\n\n'
  );
}

export const Logger = {
  debug(message: string) {
    emitLog({
      level: 'DEBUG',
      message,
      timestamp: Date.now() / 1000,
    });
  },

  info(msg: string) {
    emitLog({
      level: 'INFO',
      message: msg,
      timestamp: Date.now() / 1000,
    });
  },

  warn(msg: string) {
    emitLog({
      level: 'WARN',
      message: msg,
      timestamp: Date.now() / 1000,
    });
  },

  error(msg: string) {
    emitLog({
      level: 'ERROR',
      message: msg,
      timestamp: Date.now() / 1000,
    });
  },
}

