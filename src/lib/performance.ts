// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static measurements = new Map<string, number>()

  static startMeasurement(name: string) {
    this.measurements.set(name, performance.now())
  }

  static endMeasurement(name: string): number {
    const start = this.measurements.get(name)
    if (!start) return 0

    const duration = performance.now() - start
    this.measurements.delete(name)

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name)
    return fn().finally(() => this.endMeasurement(name))
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startMeasurement(name)
    try {
      return fn()
    } finally {
      this.endMeasurement(name)
    }
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

