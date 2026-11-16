// Per-IP limit on the unauthenticated sign-in routes (/auth/challenge,
// /auth/token). Each request stores a challenge or calls the verifier, for any
// well-formed VLAD, so without a limit anyone could fill bs_ApiChallenge or
// use this server to load the verifier.
//
//   BS_API_AUTH_RATE_PER_MIN  requests per IP per minute, per route. Default 30
//                             (a sign-in is one challenge and one token).
//
// The client IP is Fly's Fly-Client-IP, which the client can't set. Not
// x-real-ip: index.js takes that from the first X-Forwarded-For entry, which
// the client controls. Off Fly, the socket address is used.
//
// In memory, so each machine counts on its own.

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { apiError } from './auth.js';

const DEFAULT_PER_MIN = 30;
const limiters = new Map(); // `${route}:${points}` -> RateLimiterMemory

function limiter(route) {
  const points = Number(process.env.BS_API_AUTH_RATE_PER_MIN) || DEFAULT_PER_MIN;
  const key = `${route}:${points}`;
  if (!limiters.has(key)) limiters.set(key, new RateLimiterMemory({ points, duration: 60 }));
  return limiters.get(key);
}

export const clientIp = req => req.headers['fly-client-ip'] || req.socket?.remoteAddress || '';

export const authRateLimit = route => async (req, res, next) => {
  try {
    await limiter(route).consume(clientIp(req));
  } catch (e) {
    if (e instanceof Error) return next(e);
    res.set('Retry-After', String(Math.ceil(e.msBeforeNext / 1000)));
    return apiError(res, 429, 'rate_limited', 'Too many sign-in attempts. Try again in a minute.');
  }
  return next();
};

// Tests: forget all counts.
export function resetRateLimits() {
  limiters.clear();
}
