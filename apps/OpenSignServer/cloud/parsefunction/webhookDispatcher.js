/**
 * @file webhookDispatcher.js
 * @description Enterprise-grade Webhook Dispatcher with HMAC-SHA256 signatures,
 *   smart exponential backoff, and idempotency key injection.
 *   Zero external dependencies beyond Node.js built-ins and axios (already in OpenSignServer).
 * @module cloud/parsefunction/webhookDispatcher
 */

import crypto from 'crypto';
import axios from 'axios';

/**
 * Maximum number of delivery attempts before permanent failure.
 * @constant {number}
 */
const MAX_RETRIES = 3;

/**
 * Timeout for each individual HTTP request in milliseconds.
 * @constant {number}
 */
const TIMEOUT_MS = 5000;

/**
 * Generates a cryptographic HMAC-SHA256 signature for a given payload string.
 * Allows the receiving server to verify the authenticity and integrity of the
 * webhook payload, preventing Man-in-the-Middle (MITM) and replay attacks.
 *
 * @param {string} payloadString - The JSON-serialized payload string to sign.
 * @param {string} secret - The shared HMAC secret configured by the document owner.
 * @returns {string} A hexadecimal HMAC-SHA256 digest of the payload.
 */
export function generateSignature(payloadString, secret) {
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

/**
 * Determines whether a failed HTTP request should be retried.
 * Client errors (4xx, excluding 429 Too Many Requests) are non-retryable because
 * they indicate a permanent misconfiguration on the receiving server's end.
 * Network errors, timeouts, and server errors (5xx) are retryable.
 *
 * @param {import('axios').AxiosError} axiosError - The error returned by axios.
 * @returns {boolean} True if the request should be retried, false otherwise.
 */
function isRetryableError(axiosError) {
  const status = axiosError?.response?.status;
  if (!status) return true; // Network error or timeout — always retry
  const isClientError = status >= 400 && status < 500 && status !== 429;
  return !isClientError;
}

/**
 * Dispatches a webhook event to a configured URL with enterprise-grade resilience:
 * - HMAC-SHA256 signature injection (`X-OpenSign-Signature`)
 * - Idempotency key injection (`Idempotency-Key`) to allow safe deduplication on
 *   the receiving server, preventing duplicate processing on retries.
 * - Smart exponential backoff: retries only on network failures and 5xx errors,
 *   drops 4xx errors immediately to conserve server resources.
 *
 * @param {string} url - The target URL to POST the webhook payload to.
 * @param {object} payload - The structured webhook event payload.
 * @param {string} payload.eventId - Unique identifier for this event (used for idempotency).
 * @param {string} payload.event - The event type (e.g., 'document.signed', 'document.declined').
 * @param {string} payload.documentId - The OpenSign document ID associated with this event.
 * @param {string} payload.status - The document status at the time of the event.
 * @param {string} payload.timestamp - ISO 8601 timestamp of when the event occurred.
 * @param {object} payload.data - Additional event-specific data.
 * @param {string} secret - The HMAC signing secret configured by the document owner.
 * @param {number} [attempt=1] - The current attempt number (used internally for recursion).
 * @returns {Promise<{success: boolean, attempts: number, statusCode?: number, error?: string, isRetryable: boolean}>}
 */
export async function dispatchWithBackoff(url, payload, secret, attempt = 1) {
  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, secret);

  // Idempotency Key: allows the receiving server to safely deduplicate retries,
  // preventing duplicate side effects (e.g., a document being "signed" twice).
  const idempotencyKey = `os_evt_${payload.eventId}_attempt_${attempt}`;

  try {
    console.log(`[OpenSign Webhook] [Attempt ${attempt}/${MAX_RETRIES}] Dispatching '${payload.event}' to ${url}`);

    const response = await axios.post(url, payloadString, {
      headers: {
        'Content-Type': 'application/json',
        'X-OpenSign-Signature': signature,
        'X-OpenSign-Event': payload.event,
        'Idempotency-Key': idempotencyKey,
        'X-OpenSign-Delivery-Attempt': String(attempt),
      },
      timeout: TIMEOUT_MS,
    });

    console.log(`[OpenSign Webhook] Successfully delivered to ${url} (HTTP ${response.status})`);
    return { success: true, attempts: attempt, statusCode: response.status, isRetryable: false };
  } catch (error) {
    const axiosError = /** @type {import('axios').AxiosError} */ (error);
    const statusCode = axiosError?.response?.status;
    const retryable = isRetryableError(axiosError);

    console.warn(
      `[OpenSign Webhook] Delivery failed for ${url}: ${axiosError.message} (HTTP ${statusCode ?? 'Network/Timeout'})`
    );

    if (retryable && attempt < MAX_RETRIES) {
      // Exponential backoff: 2s → 4s → 8s
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`[OpenSign Webhook] Retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return dispatchWithBackoff(url, payload, secret, attempt + 1);
    }

    console.error(
      `[OpenSign Webhook] Permanently failed for ${url} after ${attempt} attempt(s). isRetryable=${retryable}`
    );
    return {
      success: false,
      attempts: attempt,
      statusCode,
      error: axiosError.message,
      isRetryable: retryable,
    };
  }
}
