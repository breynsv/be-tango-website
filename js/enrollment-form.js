/**
 * BE-TANGO Enrollment Form Handler
 *
 * Handles free trial booking form submission via CRM API.
 * Integrates with existing form-validation.js.
 */

(function() {
    'use strict';

    /**
     * Extract language from page
     */
    function getPageLanguage() {
        const lang = document.documentElement.lang || 'en';
        return lang.substring(0, 2).toUpperCase(); // 'EN', 'FR', 'NL'
    }

    /**
     * Show success message
     */
    function showSuccessMessage(form) {
        // Hide form
        form.style.display = 'none';

        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success-message';
        successDiv.style.cssText = `
            background-color: #d4edda;
            border: 2px solid var(--color-primary);
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
        `;

        successDiv.innerHTML = `
            <div style="font-size: 4rem; color: var(--color-primary); margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: var(--color-dark-navy); margin-bottom: 1rem;">Booking Confirmed!</h3>
            <p style="color: var(--color-text); margin-bottom: 0.5rem;">
                Thank you for booking your free trial class with BE-TANGO.
            </p>
            <p style="color: var(--color-text-light); font-size: 0.9rem;">
                You'll receive a confirmation email shortly with all the details.
            </p>
        `;

        form.parentNode.insertBefore(successDiv, form);

        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Show error message
     */
    function showErrorMessage(form, message) {
        // Remove existing error message if any
        const existingError = form.parentNode.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.style.cssText = `
            background-color: #f8d7da;
            border: 2px solid #dc3545;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
        `;

        errorDiv.innerHTML = `
            <div style="font-size: 2rem; color: #dc3545; margin-bottom: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <p style="color: #721c24; margin: 0; font-weight: 600;">
                ${message}
            </p>
        `;

        form.parentNode.insertBefore(errorDiv, form);

        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            errorDiv.style.transition = 'opacity 0.3s ease';
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 10000);
    }

    /**
     * Show loading state
     */
    function setLoadingState(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Submit';
        }
    }

    /**
     * Get free trial product from location selection
     */
    function getProductIdFromLocation(locationValue) {
        // This is a simple mapping - in production, you'd fetch available
        // free trials from the API and match based on the selection
        // For now, return null to be fetched dynamically
        return null;
    }

    /**
     * Fetch available free trial classes and match to location
     */
    async function matchLocationToProduct(locationValue) {
        try {
            const api = window.BETangoCRM.api;
            const response = await api.getAvailableFreeTrials();

            if (!response || !response.success || !response.data) {
                throw new Error('Unable to fetch available free trial classes');
            }

            const freeTrials = response.data;

            if (freeTrials.length === 0) {
                throw new Error('No free trial classes available at this time');
            }

            // Try to match based on location name in the selection
            const locationMatch = freeTrials.find(trial => {
                const trialLocation = `${trial.location?.city} - ${trial.location?.building_name}`;
                return locationValue.includes(trialLocation) ||
                       locationValue.includes(trial.location?.city);
            });

            // If match found, return that product_id, otherwise return first available
            return locationMatch?.id || freeTrials[0].id;

        } catch (error) {
            console.error('[Enrollment Form] Error matching location:', error);
            throw error;
        }
    }

    /**
     * Build enrollment data from form
     */
    async function buildEnrollmentData(form) {
        const formData = new FormData(form);

        const data = {
            contact: {
                first_name: formData.get('first-name') || formData.get('first_name'),
                last_name: formData.get('last-name') || formData.get('last_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                language: getPageLanguage(),
            },
            has_partner: false,
            remarks: formData.get('message') || formData.get('remarks') || '',
        };

        // Add experience and location info to remarks
        const experience = formData.get('experience');
        const location = formData.get('location');
        const partner = formData.get('partner');

        const remarksExtra = [];
        if (experience) remarksExtra.push(`Experience: ${experience}`);
        if (partner) remarksExtra.push(`Partner status: ${partner}`);
        if (remarksExtra.length > 0) {
            data.remarks = remarksExtra.join(' | ') + (data.remarks ? ' | ' + data.remarks : '');
        }

        // Match location to product_id
        try {
            data.product_id = await matchLocationToProduct(location);
        } catch (error) {
            throw new Error('Unable to find matching class. Please contact us directly.');
        }

        return data;
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');

        // Basic validation (detailed validation should be done by form-validation.js)
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        try {
            setLoadingState(submitButton, true);

            // Build enrollment data
            const enrollmentData = await buildEnrollmentData(form);

            // Submit to API
            const api = window.BETangoCRM.api;
            const response = await api.registerFreeTrial(enrollmentData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Failed to submit booking request');
            }

            // Show success message
            showSuccessMessage(form);

            console.log('[Enrollment Form] Booking submitted successfully:', response.data);

        } catch (error) {
            console.error('[Enrollment Form] Submission error:', error);

            setLoadingState(submitButton, false);

            showErrorMessage(
                form,
                error.message || 'Unable to submit booking. Please try again or contact us directly.'
            );
        }
    }

    /**
     * Initialize form handler
     */
    function initializeForm() {
        const form = document.getElementById('free-trial-form');

        if (!form) {
            console.log('[Enrollment Form] Free trial form not found on this page');
            return;
        }

        // Check if CRM API is available
        if (!window.BETangoCRM || !window.BETangoCRM.api) {
            console.error('[Enrollment Form] CRM API not loaded. Include crm-api.js before enrollment-form.js');
            return;
        }

        // Remove Formspree action if present
        if (form.hasAttribute('action')) {
            form.removeAttribute('action');
        }

        // Attach submit handler
        form.addEventListener('submit', handleFormSubmit);

        console.log('[Enrollment Form] Form handler initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeForm);
    } else {
        initializeForm();
    }

    // Add spinner animation CSS if not already present
    if (!document.getElementById('form-spinner-styles')) {
        const style = document.createElement('style');
        style.id = 'form-spinner-styles';
        style.textContent = `
            .fa-spinner.fa-spin {
                animation: fa-spin 1s infinite linear;
            }
            @keyframes fa-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    console.log('[Enrollment Form] Module loaded');

})();
