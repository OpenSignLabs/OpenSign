// Structured logger: one JSON object per line, with a level and an optional
// request id, so a single signing or mail flow can be followed in the logs.
const SENSITIVE_KEY = /pass(word)?|secret|token|key|authorization|cookie/i;

const redact = value => {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key,
      SENSITIVE_KEY.test(key) && typeof val !== 'object' ? '[redacted]' : redact(val),
    ])
  );
};

// Turns an arbitrary value into something that survives JSON.stringify.
const toSafe = value => {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, code: value.code };
  }
  if (value === undefined) return null;
  if (typeof value === 'bigint') return value.toString();
  return redact(value);
};

const emit = (level, args) => {
  const [first, ...rest] = args;
  const entry = {
    level,
    time: new Date().toISOString(),
    message: typeof first === 'string' ? first : String(toSafe(first)),
  };
  if (typeof first === 'object' && first !== null) {
    entry.details = toSafe(first);
  }
  if (rest.length === 1) {
    entry.details = toSafe(rest[0]);
  } else if (rest.length > 1) {
    entry.details = rest.map(toSafe);
  }
  let line;
  try {
    line = JSON.stringify(entry);
  } catch {
    line = JSON.stringify({ level, time: entry.time, message: String(entry.message) });
  }
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

export const logger = {
  info: (...args) => emit('info', args),
  warn: (...args) => emit('warn', args),
  error: (...args) => emit('error', args),
};

export default logger;
