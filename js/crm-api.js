/**
 * BE-TANGO CRM API Client
 *
 * Handles all communication with the Laravel CRM API backend.
 * Includes caching, error handling, and retry logic.
 */

// API Configuration
const API_CONFIG = {
    // Auto-detect environment and set base URL
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8001/api/v1'
        : 'https://crm.be-tango.be/api/v1',
    timeout: 10000, // 10 seconds
    retryAttempts: 2,
    retryDelay: 1000, // 1 second
};

/**
 * In-memory cache manager for API responses
 */
class APICache {
    constructor(ttl = 300000) { // Default 5 minutes
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Check if expired
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        return this.get(key) !== null;
    }
}

/**
 * CRM API Client Class
 */
class CRMApi {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.timeout = API_CONFIG.timeout;
        this.retryAttempts = API_CONFIG.retryAttempts;
        this.retryDelay = API_CONFIG.retryDelay;
        this.cache = new APICache();
    }

    /**
     * Core fetch wrapper with timeout and retry logic
     */
    async _fetch(endpoint, options = {}, retryCount = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Check for API error response format
            if (data.success === false) {
                throw new Error(data.message || 'API request failed');
            }

            return data;

        } catch (error) {
            clearTimeout(timeoutId);

            // Retry on network errors
            if (retryCount < this.retryAttempts && this._shouldRetry(error)) {
                await this._delay(this.retryDelay);
                return this._fetch(endpoint, options, retryCount + 1);
            }

            throw this._handleError(error);
        }
    }

    /**
     * Determine if error is retryable
     */
    _shouldRetry(error) {
        return error.name === 'AbortError' ||
               error.message.includes('NetworkError') ||
               error.message.includes('Failed to fetch');
    }

    /**
     * Handle and format errors
     */
    _handleError(error) {
        if (error.name === 'AbortError') {
            return new Error('Connection timeout. Please check your internet connection and try again.');
        }
        return error;
    }

    /**
     * Simple delay utility
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * GET request with caching
     */
    async get(endpoint, useCache = true) {
        const cacheKey = `GET:${endpoint}`;

        // Check cache first
        if (useCache && this.cache.has(cacheKey)) {
            console.log(`[CRM API] Cache hit: ${endpoint}`);
            return this.cache.get(cacheKey);
        }

        console.log(`[CRM API] Fetching: ${endpoint}`);
        const data = await this._fetch(endpoint, { method: 'GET' });

        // Store in cache
        if (useCache) {
            this.cache.set(cacheKey, data);
        }

        return data;
    }

    /**
     * POST request (no caching)
     */
    async post(endpoint, body) {
        console.log(`[CRM API] Posting to: ${endpoint}`);
        return await this._fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    // ========================================
    // API Endpoint Methods
    // ========================================

    /**
     * Get all classes with optional filters
     */
    async getClasses(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/classes?${params}` : '/classes';
        return await this.get(endpoint);
    }

    /**
     * Get beginner classes only
     */
    async getBeginnerClasses() {
        return await this.get('/classes/beginner');
    }

    /**
     * Get experienced level classes (INT, INT+, ADV)
     */
    async getExperiencedClasses() {
        return await this.get('/classes/experienced');
    }

    /**
     * Get classes by location (Brussels or Woluwe)
     */
    async getClassesByLocation(location) {
        return await this.get(`/classes/location/${encodeURIComponent(location)}`);
    }

    /**
     * Get available free trial slots
     */
    async getAvailableFreeTrials() {
        return await this.get('/free-trials/available');
    }

    /**
     * Get all locations
     */
    async getLocations() {
        return await this.get('/locations');
    }

    /**
     * Get single location by ID
     */
    async getLocation(id) {
        return await this.get(`/locations/${id}`);
    }

    /**
     * Get active languages configured in the backend
     */
    async getLanguages() {
        return await this.get('/languages');
    }

    /**
     * Submit enrollment
     */
    async submitEnrollment(enrollmentData) {
        return await this.post('/enrollments', enrollmentData);
    }

    /**
     * Register for free trial
     */
    async registerFreeTrial(registrationData) {
        return await this.post('/free-trial/register', registrationData);
    }

    /**
     * Clear cache manually
     */
    clearCache() {
        this.cache.clear();
        console.log('[CRM API] Cache cleared');
    }
}

// ========================================
// Global Instance
// ========================================

// Create global instance
window.BETangoCRM = window.BETangoCRM || {};
window.BETangoCRM.api = new CRMApi();

console.log('[CRM API] Client initialized');
console.log(`[CRM API] Environment: ${window.location.hostname === 'localhost' ? 'Development' : 'Production'}`);
console.log(`[CRM API] Base URL: ${window.BETangoCRM.api.baseURL}`);
