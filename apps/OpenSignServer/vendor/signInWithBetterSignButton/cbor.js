// Vendored from BetterSignApps server/signInWithBetterSignButton/src/cbor.js (commit fe4d432).
// Don't edit here: change it there and run
//   node server/signInWithBetterSignButton/scripts/vendor.mjs <this folder> server
// --- end of vendoring note ---
// Minimal strict CBOR decoder for the phone's LoginStatement (bs_fill v1.3,
// client/browserExtension/docs/PROTOCOL.md §1.3). Only what a statement uses: unsigned
// ints, byte strings, text strings and maps with text keys, all definite-length
// and shortest-form, map keys in canonical order. Anything else is rejected.
// The signature covers the raw bytes, so this only has to read them correctly.

const dec = new TextDecoder("utf-8", { fatal: true });

export function decodeCbor(bytes) {
  let i = 0;
  const need = (n) => {
    if (i + n > bytes.length) throw new Error("cbor: truncated");
  };
  const head = () => {
    need(1);
    const b = bytes[i++];
    const major = b >> 5;
    const info = b & 0x1f;
    let n;
    if (info < 24) n = info;
    else if (info === 24) { need(1); n = bytes[i++]; if (n < 24) throw new Error("cbor: non-shortest"); }
    else if (info === 25) { need(2); n = (bytes[i] << 8) | bytes[i + 1]; i += 2; if (n < 256) throw new Error("cbor: non-shortest"); }
    else if (info === 26) {
      need(4); n = ((bytes[i] << 24) >>> 0) + (bytes[i + 1] << 16) + (bytes[i + 2] << 8) + bytes[i + 3]; i += 4;
      if (n < 65536) throw new Error("cbor: non-shortest");
    } else if (info === 27) {
      need(8);
      let x = 0;
      for (let k = 0; k < 8; k++) x = x * 256 + bytes[i + k];
      i += 8;
      if (x < 2 ** 32 || !Number.isSafeInteger(x)) throw new Error("cbor: integer out of range");
      n = x;
    } else throw new Error("cbor: unsupported length");
    return { major, n };
  };
  const item = () => {
    const { major, n } = head();
    switch (major) {
      case 0: return n;
      case 2: { need(n); const v = bytes.slice(i, i + n); i += n; return v; }
      case 3: { need(n); const v = dec.decode(bytes.subarray(i, i + n)); i += n; return v; }
      case 5: {
        const m = new Map();
        let prev = null;
        for (let k = 0; k < n; k++) {
          const start = i;
          const key = item();
          if (typeof key !== "string") throw new Error("cbor: non-text key");
          const kb = bytes.subarray(start, i);
          if (prev && compare(prev, kb) >= 0) throw new Error("cbor: keys not in canonical order");
          prev = kb;
          m.set(key, item());
        }
        return m;
      }
      default: throw new Error("cbor: unsupported type");
    }
  };
  const v = item();
  if (i !== bytes.length) throw new Error("cbor: trailing bytes");
  return v;
}

// Key order is RFC 8949 §4.2.1 "core deterministic encoding", as PROTOCOL.md
// §1.3 specifies: bytewise lexicographic order of the keys' encoded bytes. Not
// RFC 7049's length-first "canonical" order (RFC 8949 §4.2.3); for text keys
// under 24 bytes, as in a statement, the two agree anyway, since the encoded
// head byte carries the length.
function compare(a, b) {
  for (let k = 0; k < Math.min(a.length, b.length); k++) if (a[k] !== b[k]) return a[k] - b[k];
  return a.length - b.length;
}
