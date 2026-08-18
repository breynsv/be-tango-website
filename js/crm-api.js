/**
 * BE-TANGO CRM API Client
 *
 * Handles all communication with the Laravel CRM API backend.
 * Includes caching, error handling, and retry logic.
 */

// API Configuration — base URL comes from api-config.js (loaded first)
const API_CONFIG = Object.assign({
    baseURL: 'https://betango.membrero.com/api/v1', // fallback if api-config.js not loaded
    timeout: 10000, // 10 seconds
    retryAttempts: 2,
    retryDelay: 1000, // 1 second
}, window.API_CONFIG);

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
                // The site sends `Referrer-Policy: strict-origin-when-cross-origin`
                // (_headers), so a cross-origin call to the CRM carries only the
                // origin — "https://be-tango.be/", no path. The enrollment endpoint
                // builds the hosted-checkout return URL from that Referer, so the
                // customer came back to the root language splash (which drops the
                // query string) instead of the page they registered on, and the
                // payment-return bar never showed. Send the full URL for this
                // same-scheme https call so the backend can return them to the
                // exact page. (Downgraded https->http still sends nothing.)
                referrerPolicy: 'no-referrer-when-downgrade',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // The body of a failed response carries the reason — e.g. a 409
                // with code 'existing_student' telling us to route this person to
                // the portal. Throwing the status alone threw that away, so every
                // handled refusal looked like a generic server error.
                let body = null;
                try { body = await response.json(); } catch (_) { /* not JSON */ }

                const err = new Error(
                    (body && body.message) || `HTTP ${response.status}: ${response.statusText}`
                );
                err.status = response.status;
                err.data = body;
                throw err;
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
     * Fetch the SEPA EPC payment QR code for a confirmed enrollment.
     * Called lazily after the confirmation page is already shown.
     */
    async fetchPaymentQr(enrollmentId, paymentReference) {
        return await this.post('/enrollments/payment-qr', {
            enrollment_id: enrollmentId,
            payment_reference: paymentReference,
        });
    }

    /**
     * Register for free trial
     */
    async registerFreeTrial(registrationData) {
        return await this.post('/free-trial/register', registrationData);
    }

    /**
     * Submit the general contact form.
     * @param {Object} data - { first_name, last_name, email, phone, topic, message, lang }
     */
    async submitContactForm(data) {
        return await this.post('/contact', data);
    }

    /**
     * Submit a private lessons inquiry.
     * @param {Object} data - { name, email, phone, lesson_type, message, lang }
     */
    async submitPrivateLessonsForm(data) {
        return await this.post('/private-lessons', data);
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
