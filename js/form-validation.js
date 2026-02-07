/**
 * BE-TANGO Form Validation
 * Real-time form validation with error messages
 * Validates email format, required fields, phone numbers
 */

(function() {
  'use strict';

  // Validation rules
  const validationRules = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^[0-9()#&+*\-=.]+$/,
      message: 'Please enter a valid phone number (numbers and phone characters only)'
    },
    required: {
      message: 'This field is required'
    },
    minLength: {
      message: 'This field is too short'
    }
  };

  /**
   * Initialize validation for a form
   * @param {HTMLFormElement} form - The form element to validate
   */
  function initFormValidation(form) {
    if (!form) return;

    // Add novalidate to prevent browser default validation
    form.setAttribute('novalidate', 'true');

    // Get all form inputs
    const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"], textarea[required], select[required]');

    // Add real-time validation to each input
    inputs.forEach(input => {
      // Validate on blur (when user leaves field)
      input.addEventListener('blur', () => validateField(input));

      // Validate on input (as user types) - but only after first blur
      input.addEventListener('input', () => {
        if (input.classList.contains('touched')) {
          validateField(input);
        }
      });

      // Mark field as touched on first blur
      input.addEventListener('blur', () => {
        input.classList.add('touched');
      }, { once: true });
    });

    // Validate entire form on submit
    form.addEventListener('submit', (e) => {
      let isValid = true;

      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();

        // Focus on first invalid field
        const firstInvalid = form.querySelector('.form-group.error input, .form-group.error textarea, .form-group.error select');
        if (firstInvalid) {
          firstInvalid.focus();
          // Scroll to first error
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Show form-level error message
        showFormError(form, 'Please correct the errors above before submitting.');
      } else {
        // Clear form-level error message
        clearFormError(form);

        // Show loading state
        showFormLoading(form);
      }
    });
  }

  /**
   * Validate a single field
   * @param {HTMLElement} field - The input/textarea/select to validate
   * @returns {boolean} - True if valid, false if invalid
   */
  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    const formGroup = field.closest('.form-group');

    // Clear previous error
    clearFieldError(formGroup);

    // Check if empty and required
    if (required && !value) {
      showFieldError(formGroup, field, validationRules.required.message);
      return false;
    }

    // If not required and empty, it's valid
    if (!required && !value) {
      return true;
    }

    // Email validation
    if (type === 'email' || field.name === 'email') {
      if (!validationRules.email.pattern.test(value)) {
        showFieldError(formGroup, field, validationRules.email.message);
        return false;
      }
    }

    // Phone validation
    if (type === 'tel' || field.name === 'phone') {
      if (value && !validationRules.phone.pattern.test(value)) {
        showFieldError(formGroup, field, validationRules.phone.message);
        return false;
      }
    }

    // Min length validation
    const minLength = field.getAttribute('minlength');
    if (minLength && value.length < parseInt(minLength)) {
      showFieldError(formGroup, field, `Please enter at least ${minLength} characters`);
      return false;
    }

    // Pattern validation (if specified)
    const pattern = field.getAttribute('pattern');
    if (pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        const title = field.getAttribute('title');
        showFieldError(formGroup, field, title || 'Please match the requested format');
        return false;
      }
    }

    // Select validation
    if (field.tagName === 'SELECT' && required) {
      if (!value || value === '') {
        showFieldError(formGroup, field, 'Please select an option');
        return false;
      }
    }

    // Checkbox validation
    if (field.type === 'checkbox' && required) {
      if (!field.checked) {
        showFieldError(formGroup, field, 'You must agree to continue');
        return false;
      }
    }

    // If we get here, field is valid
    markFieldValid(formGroup, field);
    return true;
  }

  /**
   * Show error message for a field
   */
  function showFieldError(formGroup, field, message) {
    if (!formGroup) return;

    formGroup.classList.add('error');
    formGroup.classList.remove('valid');
    field.setAttribute('aria-invalid', 'true');

    // Create or update error message
    let errorMsg = formGroup.querySelector('.error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('span');
      errorMsg.className = 'error-message';
      errorMsg.setAttribute('role', 'alert');

      // Insert after the input/select/textarea
      if (field.tagName === 'SELECT' || field.type === 'checkbox') {
        field.parentNode.appendChild(errorMsg);
      } else {
        field.parentNode.insertBefore(errorMsg, field.nextSibling);
      }
    }
    errorMsg.textContent = message;
  }

  /**
   * Clear error message for a field
   */
  function clearFieldError(formGroup) {
    if (!formGroup) return;

    formGroup.classList.remove('error');
    const errorMsg = formGroup.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.remove();
    }

    const field = formGroup.querySelector('input, textarea, select');
    if (field) {
      field.setAttribute('aria-invalid', 'false');
    }
  }

  /**
   * Mark field as valid
   */
  function markFieldValid(formGroup, field) {
    if (!formGroup) return;

    formGroup.classList.add('valid');
    formGroup.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
  }

  /**
   * Show form-level error message
   */
  function showFormError(form, message) {
    let errorBox = form.querySelector('.form-error-message');
    if (!errorBox) {
      errorBox = document.createElement('div');
      errorBox.className = 'form-error-message';
      errorBox.setAttribute('role', 'alert');
      form.insertBefore(errorBox, form.firstChild);
    }
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  }

  /**
   * Clear form-level error message
   */
  function clearFormError(form) {
    const errorBox = form.querySelector('.form-error-message');
    if (errorBox) {
      errorBox.style.display = 'none';
    }
  }

  /**
   * Show loading state on form
   */
  function showFormLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Store original text
      const originalText = submitBtn.textContent;
      submitBtn.setAttribute('data-original-text', originalText);

      // Add loading text and spinner
      submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
    }
  }

  /**
   * Hide loading state on form
   */
  function hideFormLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Restore original text
      const originalText = submitBtn.getAttribute('data-original-text');
      if (originalText) {
        submitBtn.textContent = originalText;
      }
    }
  }

  /**
   * Initialize all forms on the page
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Find all forms with validation
    const forms = document.querySelectorAll('form.contact-form, form#contactForm, form#free-trial-form');
    forms.forEach(form => {
      initFormValidation(form);
    });

    // Also initialize any forms added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.matches && node.matches('form.contact-form, form#contactForm, form#free-trial-form')) {
              initFormValidation(node);
            }
            // Check child forms
            const childForms = node.querySelectorAll && node.querySelectorAll('form.contact-form, form#contactForm, form#free-trial-form');
            if (childForms) {
              childForms.forEach(form => initFormValidation(form));
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Auto-initialize
  init();

  // Expose API for manual initialization
  window.BETangoValidation = {
    init: init,
    initForm: initFormValidation,
    validateField: validateField
  };

})();
