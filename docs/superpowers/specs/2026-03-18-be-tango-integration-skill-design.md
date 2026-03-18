# BE-TANGO Website Integration Skill — Design Spec

**Date:** 2026-03-18
**Scope:** Integration layer between the BE-TANGO static frontend and the BETANGOCRM Laravel API

---

## Purpose

A Claude Code skill that acts as a specialist for the integration layer between:
- **Frontend:** `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/` (served on port 8002)
- **Backend:** `/Users/svenbreynaert/Sites/BETANGOCRM/betangocrm-laravel/` (served on port 8001)

The skill enables autonomous debugging and full-stack feature building (frontend JS/HTML + backend Laravel API) with minimal back-and-forth with the user.

---

## Skill Trigger

Invoke when:
- Working on class schedule display, enrollment forms, or newsletter signup
- Debugging API integration issues (network errors, CORS, empty data, form failures)
- Adding new API-connected features to the frontend
- Modifying `crm-api.js`, `schedule-loader.js`, `enrollment-modal.js`, or any future integration JS
- Modifying `routes/api.php` or controllers in `app/Http/Controllers/Api/`

---

## Structure: Feature-map with shared foundation

### 1. Foundation

**Two codebases, always in sync:**
- Frontend: `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/`
- Backend: `/Users/svenbreynaert/Sites/BETANGOCRM/betangocrm-laravel/`

**Frontend JS files (integration layer):**
- `js/crm-api.js` + `js/crm-api.min.js` — base API client, `window.BETangoCRM.api`
- `js/schedule-loader.js` + `.min.js` — fetches & renders class schedules
- `js/enrollment-modal.js` + `.min.js` — sign-up modal & payment summary
- *(newsletter JS — to be created)*

**Backend API files:**
- `routes/api.php` — all API v1 routes
- `app/Http/Controllers/Api/` — ClassController, EnrollmentController, NewsletterController, LocationController, LanguageController

**API base URL (auto-detected in `crm-api.js`):**
- Dev: `http://127.0.0.1:8001/api/v1`
- Prod: `https://crm.be-tango.be/api/v1`

**Critical conventions:**
- Every change to a `.js` file requires updating its `.min.js` counterpart
- Backend responses follow `{ success: true, data: [...] }` shape
- Rate limits: GET endpoints 60/min, POST endpoints 5/min
- Languages are currently hardcoded in frontend JS as EN/FR/NL. The backend has a `/languages` endpoint — in the future (multi-school SaaS), the frontend should fetch languages dynamically from the API instead of hardcoding them.

---

### 2. Schedule Integration

**Frontend:** `js/schedule-loader.js`
**Backend:** `app/Http/Controllers/Api/ClassController.php`

**API endpoints consumed:**
- `GET /classes` — all classes → `window.BETangoCRM.api.getClasses()`
- `GET /classes/beginner` — level_code 0 → `api.getBeginnerClasses()`
- `GET /classes/experienced` — level_codes 1, 2, 21, 3, 4 → `api.getExperiencedClasses()`
- `GET /classes/location/{location}` — by city name → `api.getClassesByLocation(location)`
- `GET /free-trials/available` — free trial slots → `api.getAvailableFreeTrials()`

**Page type auto-detection** (URL path keywords → API method):
- `beginner` / `debutant` / `beginners` → `api.getBeginnerClasses()`
- `experienced` / `experimentes` / `ervaring` → `api.getExperiencedClasses()`
- `brussels` / `bruxelles` / `brussel` → `api.getClassesByLocation('Brussels')`
- `woluwe` → `api.getClassesByLocation('Woluwe')`
- *(no match)* → `api.getClasses()`

**HTML trigger:** any element with `data-schedule-container` attribute gets populated. `data-level-cards-container` gets level cards on experienced pages.

**Debug flow (autonomous):**
1. Check browser console for `[Schedule Loader]` and `[CRM API]` log lines — confirm initialization and which endpoint was called
2. Check Network tab for the API request — look for CORS errors, 422/500 status, or empty `data: []`
3. If CORS error: CORS is pre-configured to allow `http://localhost:8002` and `http://127.0.0.1:8002`. Verify the origin in the browser request matches exactly (protocol + host + port). Check `betangocrm-laravel/config/cors.php`.
4. If 500: check `betangocrm-laravel/storage/logs/laravel.log`
5. If `data: []`: check that the active semester has classes assigned in the CRM admin

**Build flow (adding/extending):**
1. Add route to `routes/api.php`
2. Add method to `ClassController`
3. Add API method to `CRMApi` class in `crm-api.js`
4. Add case to `fetchClasses()` switch in `schedule-loader.js`, calling the new API method
5. Add translations for EN/FR/NL in the `TRANSLATIONS` object
6. Update both `.min.js` files

---

### 3. Enrollment Integration

**Frontend:** `js/enrollment-modal.js` (uses `window.BETangoCRM.api`)
**Backend:** `app/Http/Controllers/Api/EnrollmentController.php`

**API endpoints consumed:**
- `POST /enrollments` → `api.submitEnrollment(enrollmentData)` — paid class signup, returns payment details + SEPA QR code data
- `POST /free-trial/register` → `api.registerFreeTrial(registrationData)` — free trial registration

**HTML trigger:** `.btn-sign-up` buttons with data attributes (HTML kebab-case, read in JS as camelCase):
- `data-product-id` → `btn.dataset.productId`
- `data-class-name` → `btn.dataset.className`
- `data-price` → `btn.dataset.price`
- `data-location` → `btn.dataset.location`

**Modal flow:** button click → modal opens with form → submit → API call → success card with SEPA payment details

**Debug flow (autonomous):**
1. Check console for modal initialization errors
2. On submit failure: check Network tab for the POST request — inspect request payload and response body
3. If 422: check `EnrollmentController@store` validation rules against what the form sends
4. If 500: check `betangocrm-laravel/storage/logs/laravel.log`
5. If modal doesn't open: verify `.btn-sign-up` has all four required `data-*` attributes and `enrollment-modal.js` is loaded on the page
6. If SEPA QR not rendering: verify response contains `payment_reference`, `iban`, `amount`, `due_date`

**Build flow:**
1. Add/modify route in `routes/api.php`
2. Update `EnrollmentController` — add validation rules and response fields
3. Verify/update `submitEnrollment(enrollmentData)` or `registerFreeTrial(registrationData)` method signature in `crm-api.js` to match the payload shape
4. Update modal form HTML and JS handler in `enrollment-modal.js`
5. Add translations in the `T` object for EN/FR/NL
6. Update both `.min.js` files

---

### 4. Newsletter Integration

**Frontend:** *(to be created — no JS file exists yet)*
**Backend:** `app/Http/Controllers/Api/NewsletterController.php`

**API endpoint:**
- `POST /newsletter/bootcamp` — required payload: `{ email: string }`. Creates a Contact with `level: -1` if not already in the CRM.

**Current state:** Backend route and controller exist. Frontend implementation is pending.

**Debug flow (autonomous):**
1. Check Network tab for the POST to `/newsletter/bootcamp`
2. If 422: backend only validates `email` (required, valid email format) — verify the form is sending a valid email field
3. If 500: check `betangocrm-laravel/storage/logs/laravel.log`
4. If no request fires: verify the form submit handler is attached and `crm-api.js` is loaded on the page

**Build flow (when implementing):**
1. `subscribeNewsletter(data)` does not yet exist in `crm-api.js` — add it: `POST /newsletter/bootcamp`, payload `{ email }`, returns `{ success: true, message: 'Subscribed successfully' }`
2. Create `js/newsletter.js` — form submit handler, success/error states, multilingual messages for EN/FR/NL
3. Add newsletter signup form HTML to the relevant pages — EN, FR, NL versions
4. Load `newsletter.js` and `crm-api.js` on those pages
5. Create `js/newsletter.min.js`
