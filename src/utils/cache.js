/**
 * Simple In-Memory Cache for Performance Optimization
 * Caches calculation results to avoid redundant computations
 */

class SimpleCache {
  constructor(ttlMs = 300000) { // 5 minute default TTL
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  /**
   * Generate cache key from input data
   * @param {string} calculationType - Type of calculation
   * @param {Object} data - Input data
   * @returns {string} Cache key
   */
  generateKey(calculationType, data) {
    // Create deterministic key from input data
    const keyData = {
      type: calculationType,
      tariffType: data.tariffType,
      voltageLevel: data.voltageLevel,
      ftRateSatang: data.ftRateSatang,
      peakKvar: data.peakKvar,
      highestDemandChargeLast12m: data.highestDemandChargeLast12m,
      usage: data.usage
    };
    
    return JSON.stringify(keyData);
  }

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Store result in cache
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl
    };
  }
}

// Create singleton instance
const cache = new SimpleCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 300000);

module.exports = {
  cache,
  SimpleCache
};