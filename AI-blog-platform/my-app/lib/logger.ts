type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(options: LoggerOptions) {
    this.level = options.level || 'info';
    this.prefix = options.prefix || '';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  private logToConsole(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(message);
    const metaString = meta ? JSON.stringify(meta, null, 2) : '';

    switch (level) {
      case 'debug':
        console.debug(`[${timestamp}] [DEBUG] ${formattedMessage}`, metaString);
        break;
      case 'info':
        console.info(`[${timestamp}] [INFO] ${formattedMessage}`, metaString);
        break;
      case 'warn':
        console.warn(`[${timestamp}] [WARN] ${formattedMessage}`, metaString);
        break;
      case 'error':
        console.error(`[${timestamp}] [ERROR] ${formattedMessage}`, metaString);
        break;
    }
  }

  debug(message: string, meta?: unknown): void {
    this.logToConsole('debug', message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.logToConsole('info', message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.logToConsole('warn', message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.logToConsole('error', message, meta);
  }
}

// Create a singleton logger instance
export const logger = new Logger({
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  prefix: 'AI-Blog-Platform',
});