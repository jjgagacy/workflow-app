import { Event } from "../core/entities/event/writer-entities.js";

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogData {
  level: LogLevel;
  message: string;
  timestamp: number;
}

function emitLog(logData: LogData) {
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

