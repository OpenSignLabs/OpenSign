/**
 * @file webhookDispatcher.test.js
 * @description Integration test suite for the OpenSign Enterprise Webhook Dispatcher.
 *   Tests are written using Jest with ESM module support.
 *   Run with: node --experimental-vm-modules node_modules/.bin/jest webhookDispatcher.test.js
 */

import { jest } from '@jest/globals';
import { generateSignature, dispatchWithBackoff } from './webhookDispatcher.js';

// ─── Mock axios at the module level ───────────────────────────────────────────
jest.mock('axios', () => ({
  default: {
    post: jest.fn(),
  },
}));

import axios from 'axios';
const mockPost = /** @type {jest.MockedFunction<typeof axios.post>} */ (axios.post);

// ─── Shared Test Fixtures ──────────────────────────────────────────────────────
const MOCK_SECRET = 'os_secret_test_123';
const MOCK_URL = 'https://client-endpoint.example.com/webhook';

/** @type {import('./webhookDispatcher.js').WebhookPayload} */
const MOCK_PAYLOAD = {
  eventId: 'evt_abc123',
  event: 'document.signed',
  documentId: 'doc_999',
  status: 'COMPLETED',
  timestamp: '2026-04-17T00:00:00.000Z',
  data: { signerEmail: 'john@example.com' },
};

// ─── Helper to create an Axios-like error ────────────────────────────────────
function axiosError(status, message = 'Request failed') {
  return Object.assign(new Error(message), {
    isAxiosError: true,
    message,
    response: status ? { status } : undefined,
  });
}

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('webhookDispatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─── 1. HMAC Signature Integrity ────────────────────────────────────────
  describe('generateSignature', () => {
    it('produces a 64-character hexadecimal SHA-256 HMAC digest', () => {
      const sig = generateSignature('test-payload', MOCK_SECRET);
      expect(sig).toHaveLength(64);
      expect(sig).toMatch(/^[a-f0-9]{64}$/);
    });

    it('is deterministic — same input always produces the same signature', () => {
      const sig1 = generateSignature('payload', MOCK_SECRET);
      const sig2 = generateSignature('payload', MOCK_SECRET);
      expect(sig1).toBe(sig2);
    });

    it('produces distinct signatures for different secrets', () => {
      const sig1 = generateSignature('payload', 'secret-A');
      const sig2 = generateSignature('payload', 'secret-B');
      expect(sig1).not.toBe(sig2);
    });

    it('produces distinct signatures for different payloads', () => {
      const sig1 = generateSignature('payload-A', MOCK_SECRET);
      const sig2 = generateSignature('payload-B', MOCK_SECRET);
      expect(sig1).not.toBe(sig2);
    });
  });

  // ─── 2. Successful First-Attempt Delivery ────────────────────────────────
  describe('dispatchWithBackoff — successful delivery', () => {
    it('delivers webhook successfully on first attempt', async () => {
      mockPost.mockResolvedValueOnce({ status: 200 });

      const result = await dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(result.statusCode).toBe(200);
      expect(result.isRetryable).toBe(false);
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('sends the correct headers including HMAC signature and idempotency key', async () => {
      mockPost.mockResolvedValueOnce({ status: 200 });

      await dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);

      expect(mockPost).toHaveBeenCalledWith(
        MOCK_URL,
        JSON.stringify(MOCK_PAYLOAD),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-OpenSign-Signature': expect.stringMatching(/^[a-f0-9]{64}$/),
            'X-OpenSign-Event': 'document.signed',
            'Idempotency-Key': 'os_evt_evt_abc123_attempt_1',
            'X-OpenSign-Delivery-Attempt': '1',
          }),
        })
      );
    });

    it('the outgoing signature matches a locally computed HMAC', async () => {
      mockPost.mockResolvedValueOnce({ status: 200 });
      await dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);

      const [[, , callOptions]] = mockPost.mock.calls;
      const outgoingSignature = callOptions.headers['X-OpenSign-Signature'];
      const expectedSignature = generateSignature(JSON.stringify(MOCK_PAYLOAD), MOCK_SECRET);

      expect(outgoingSignature).toBe(expectedSignature);
    });
  });

  // ─── 3. Smart Retry on 5xx Server Error ──────────────────────────────────
  describe('dispatchWithBackoff — smart retries', () => {
    it('retries on HTTP 500 and succeeds on second attempt', async () => {
      mockPost
        .mockRejectedValueOnce(axiosError(500, 'Internal Server Error'))
        .mockResolvedValueOnce({ status: 200 });

      const promise = dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(mockPost).toHaveBeenCalledTimes(2);
    });

    it('retries on network timeout (no response status)', async () => {
      mockPost
        .mockRejectedValueOnce(axiosError(undefined, 'timeout of 5000ms exceeded'))
        .mockResolvedValueOnce({ status: 200 });

      const promise = dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('retries on HTTP 429 Too Many Requests (rate-limited, not a permanent client error)', async () => {
      mockPost
        .mockRejectedValueOnce(axiosError(429, 'Too Many Requests'))
        .mockResolvedValueOnce({ status: 200 });

      const promise = dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });
  });

  // ─── 4. Non-Retryable 4xx Error Blocking ─────────────────────────────────
  describe('dispatchWithBackoff — non-retryable errors', () => {
    it.each([400, 401, 403, 404, 422])(
      'does NOT retry on HTTP %i (client error)',
      async (status) => {
        mockPost.mockRejectedValueOnce(axiosError(status));

        const result = await dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);

        expect(result.success).toBe(false);
        expect(result.attempts).toBe(1);
        expect(result.isRetryable).toBe(false);
        expect(mockPost).toHaveBeenCalledTimes(1);
      }
    );
  });

  // ─── 5. Permanent Failure After MAX_RETRIES ───────────────────────────────
  describe('dispatchWithBackoff — exhaustion', () => {
    it('fails permanently after 3 consecutive 503 errors (MAX_RETRIES)', async () => {
      mockPost.mockRejectedValue(axiosError(503, 'Service Unavailable'));

      const promise = dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);
      await jest.runAllTimersAsync();
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
      expect(result.isRetryable).toBe(true);
      expect(mockPost).toHaveBeenCalledTimes(3);
    });
  });

  // ─── 6. Idempotency Key Increment ────────────────────────────────────────
  describe('dispatchWithBackoff — idempotency', () => {
    it('increments the idempotency key suffix with each retry attempt', async () => {
      mockPost.mockRejectedValue(axiosError(504, 'Gateway Timeout'));

      const promise = dispatchWithBackoff(MOCK_URL, MOCK_PAYLOAD, MOCK_SECRET);
      await jest.runAllTimersAsync();
      await jest.runAllTimersAsync();
      await promise;

      expect(mockPost).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Idempotency-Key': 'os_evt_evt_abc123_attempt_1' }),
        })
      );
      expect(mockPost).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Idempotency-Key': 'os_evt_evt_abc123_attempt_2' }),
        })
      );
      expect(mockPost).toHaveBeenNthCalledWith(
        3,
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Idempotency-Key': 'os_evt_evt_abc123_attempt_3' }),
        })
      );
    });
  });
});
