// _dev/e2e/helpers/email-verify.js
//
// Replaces helpers/brevo.js, which polled api.brevo.com/v3/smtp/emails.
//
// Brevo is no longer a send path in Membrero — only historical column names
// (brevo_message_id, last_brevo_event_at) and legacy inbound-webhook parsing remain,
// and SendCampaignEmailJob states outright: "No Brevo fallback". BREVO_API_KEY never
// held a real value either; it was the literal string 'FILL_IN_MANUALLY'. So the old
// helper could only ever time out after 60s, in every run, forever.
//
// The correct replacement is to verify against our OWN record of the send rather than a
// third party's. Both mails this suite cares about (enrollment confirmation, free-trial
// waitlist) go SendTemplateEmailJob -> EmailService::sendEmailWithTemplate -> the
// `email_logs` table. That needs a read-only endpoint on the CRM beside the existing
// /api/v1/e2e/cleanup, guarded by the same X-E2E-Secret header, returning recent
// email_logs rows for a given test address.
//
// That endpoint does not exist yet. Until it does, this helper SKIPS loudly rather than
// asserting something it cannot check — a test that silently passes without verifying
// is worse than one that is honestly marked unverified.

/**
 * Verify that `toEmail` received a mail whose subject contains `subjectKeyword`.
 *
 * Returns { skipped: true } when no verification backend is configured.
 * Throws only when a backend IS configured and the mail genuinely never arrived.
 */
async function verifyEmailDelivered(toEmail, subjectKeyword) {
  console.log(
    `    ! email verification SKIPPED for ${toEmail} ` +
    `(expected subject containing "${subjectKeyword}") — ` +
    `no backend configured; see helpers/email-verify.js`
  );
  return { skipped: true };
}

module.exports = { verifyEmailDelivered };
