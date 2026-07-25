/**
 * Polyfills for running youtubei.js inside React Native (Hermes).
 *
 * youtubei.js is a Node.js library that expects:
 *  - URL / URLSearchParams (global)
 *  - TextDecoder (global)
 *  - crypto (global)
 *  - eval() for signature deciphering
 *
 * Hermes ships in Expo/RN has most of these. The one that
 * doesn't work out-of-the-box is eval() used by the cipher
 * module to run YouTube's obfuscated signature function.
 *
 * Strategy:
 *  1. Shim eval with a safe Function()-based fallback that Hermes supports.
 *  2. Polyfill missing globals if absent.
 */

// ── 1. Safe eval shim ──────────────────────────────────────────
// Hermes supports `new Function(code)` which is equivalent to
// eval for our use-case (the cipher runs a small JS snippet).
if (typeof globalThis.eval !== "function") {
  const RealFunction = Function;
  (globalThis as any).eval = function evalPolyfill(code: string) {
    // eslint-disable-next-line no-new-func
    return new RealFunction("return (" + code + ")")();
  };
}

// ── 2. TextDecoder / TextEncoder ───────────────────────────────
if (typeof globalThis.TextDecoder === "undefined") {
  try {
    const { TextDecoder: TD } = require("text-encoding");
    (globalThis as any).TextDecoder = TD;
  } catch {
    // Minimal fallback — youtubei.js only decodes UTF-8 strings
    (globalThis as any).TextDecoder = class TextDecoder {
      decode(input?: BufferSource): string {
        if (!input) return "";
        if (input instanceof Uint8Array) {
          return Array.from(input)
            .map((b) => String.fromCharCode(b))
            .join("");
        }
        return String(input);
      }
    };
  }
}

if (typeof globalThis.TextEncoder === "undefined") {
  (globalThis as any).TextEncoder = class TextEncoder {
    encode(str: string): Uint8Array {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
      return arr;
    }
  };
}

// ── 3. URL polyfill (Expo/Fetch already has it, but guard) ─────
if (typeof globalThis.URL === "undefined") {
  try {
    require("react-native-url-polyfill/auto");
  } catch {
    // URL is already available in modern RN
  }
}

// ── 4. crypto.subtle minimal shim ──────────────────────────────
// youtubei.js uses crypto.subtle.digest for signature operations.
// Hermes doesn't ship SubtleCrypto. We shim with a pure-JS SHA-1
// (only used by the cipher module for the nsig challenge).
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = {};
}
if (typeof (globalThis as any).crypto.subtle === "undefined") {
  (globalThis as any).crypto.subtle = {
    async digest(algorithm: AlgorithmIdentifier, data: ArrayBuffer) {
      const algo =
        typeof algorithm === "string" ? algorithm : algorithm.name;
      if (algo === "SHA-1" || algo === "sha-1") {
        return sha1(data);
      }
      throw new Error(`Unsupported digest algorithm: ${algo}`);
    },
  };
}

// ── Minimal pure-JS SHA-1 (RFC 3174) ──────────────────────────
function sha1(buffer: ArrayBuffer): ArrayBuffer {
  const view = new Uint8Array(buffer);
  let h0 = 0x67452301,
    h1 = 0xefcdab89,
    h2 = 0x98badcfe,
    h3 = 0x10325476,
    h4 = 0xc3d2e1f0;

  const msgLen = view.length;
  const bitLen = msgLen * 8;

  // Pad message
  const padLen = ((56 - ((msgLen + 1) % 64)) + 64) % 64;
  const padded = new Uint8Array(msgLen + 1 + padLen + 8);
  padded.set(view);
  padded[msgLen] = 0x80;

  // Append length in bits as big-endian 64-bit
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);

  // Process 512-bit chunks
  for (let offset = 0; offset < padded.length; offset += 64) {
    const w = new Uint32Array(80);
    for (let i = 0; i < 16; i++) {
      w[i] = dv.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 80; i++) {
      w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (let i = 0; i < 80; i++) {
      let f: number, k: number;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (rotl(a, 5) + f + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new ArrayBuffer(20);
  const out = new DataView(result);
  out.setUint32(0, h0, false);
  out.setUint32(4, h1, false);
  out.setUint32(8, h2, false);
  out.setUint32(12, h3, false);
  out.setUint32(16, h4, false);
  return result;
}

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

// ── 5. globalThis globals that youtubei.js references ──────────
if (typeof (globalThis as any).global === "undefined") {
  (globalThis as any).global = globalThis;
}
if (typeof (globalThis as any).process === "undefined") {
  (globalThis as any).process = { env: {}, version: "v18.0.0" };
}
if (typeof (globalThis as any).Buffer === "undefined") {
  // Minimal Buffer shim — only needed for isBuffer checks
  (globalThis as any).Buffer = {
    isBuffer: () => false,
    from: (data: any) => new Uint8Array(data),
  };
}
