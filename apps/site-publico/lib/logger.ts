// Database access logger for Next.js API routes

interface LogEntry {
  timestamp: string;
  method: string;
  route: string;
  query?: Record<string, any>;
  duration: number;
  success: boolean;
  error?: string;
  rowsAffected?: number;
}

class DatabaseLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Keep last 1000 logs

  log(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const status = entry.success ? '✅' : '❌';
      console.log(
        `${status} [DB] ${entry.method} ${entry.route} - ${entry.duration}ms` +
        (entry.rowsAffected !== undefined ? ` (${entry.rowsAffected} rows)` : '') +
        (entry.error ? ` - Error: ${entry.error}` : '')
      );
    }
  }

  getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  getStats(): {
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
  } {
    const successful = this.logs.filter(l => l.success).length;
    const failed = this.logs.length - successful;
    const totalDuration = this.logs.reduce((sum, l) => sum + l.duration, 0);
    const avgDuration = this.logs.length > 0 ? totalDuration / this.logs.length : 0;

    return {
      total: this.logs.length,
      successful,
      failed,
      avgDuration: Math.round(avgDuration),
    };
  }

  clear(): void {
    this.logs = [];
  }
}

// Singleton instance
export const dbLogger = new DatabaseLogger();

// Middleware function to log database access
export async function logDatabaseAccess<T>(
  method: string,
  route: string,
  queryFn: () => Promise<T>,
  query?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  let success = false;
  let error: string | undefined;
  let rowsAffected: number | undefined;
  let result: T;

  try {
    result = await queryFn();
    
    // Try to determine rows affected
    if (Array.isArray(result)) {
      rowsAffected = result.length;
    } else if (result && typeof result === 'object' && 'rowCount' in result) {
      rowsAffected = (result as any).rowCount;
    }

    success = true;
  } catch (err: any) {
    error = err.message || 'Unknown error';
    throw err;
  } finally {
    const duration = Date.now() - startTime;
    dbLogger.log({
      timestamp: new Date().toISOString(),
      method,
      route,
      query,
      duration,
      success,
      error,
      rowsAffected,
    });
  }

  return result;
}

