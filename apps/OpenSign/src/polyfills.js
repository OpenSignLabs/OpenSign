// below code is used to handle undefined Promise.withResolvers for safari for react-pdf
if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 🔐 Polyfill crypto.randomUUID for non-secure contexts (LAN IP, old browsers)
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = {};
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = function () {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // RFC 4122 version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return [...bytes]
      .map(
        (b, i) =>
          ([4, 6, 8, 10].includes(i) ? "-" : "") +
          b.toString(16).padStart(2, "0")
      )
      .join("");
  };
}

// Usage:
// const { promise, resolve, reject } = Promise.withResolvers()
// console.log(promise, resolve, reject) // Promise { <pending> } [Function (anonymous)] [Function (anonymous)]
// ... Do something async and then call resolve or reject!
