type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
    };

    // In production, we'd write this to stdout as JSON for log aggregators (e.g. Datadog)
    // In dev, we can pretty print it
    if (process.env.NODE_ENV === 'production') {
      console[level === 'debug' ? 'log' : level](JSON.stringify(logEntry));
    } else {
      const colorMap = {
        info: '\x1b[36m', // Cyan
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[90m', // Gray
      };
      const reset = '\x1b[0m';
      
      let formattedMsg = `[${timestamp}] ${colorMap[level]}${level.toUpperCase()}${reset}: ${message}`;
      if (context) {
        formattedMsg += `\n${JSON.stringify(context, null, 2)}`;
      }
      
      console[level === 'debug' ? 'log' : level](formattedMsg);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.log('error', message, { 
      ...context, 
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error 
    });
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, context);
    }
  }
}

export const logger = new Logger();
