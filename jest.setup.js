import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "stream/web";

import crypto from "crypto";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;

if (typeof global.crypto === "undefined" || !global.crypto.randomUUID) {
  global.crypto = crypto;
}

if (typeof window !== "undefined") {
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
  window.ReadableStream = ReadableStream;
  if (!window.crypto || !window.crypto.randomUUID) {
    window.crypto = crypto;
  }
}

// Polyfill Request and Response for Next.js route handler tests in Jest JSDOM environment
if (typeof global.Request === "undefined") {
  global.Request = class Request {
    constructor(input, init = {}) {
      const urlStr = typeof input === "string" ? input : (input && input.url) || "";
      Object.defineProperty(this, "url", {
        value: urlStr,
        writable: true,
        configurable: true,
        enumerable: true
      });
      
      const methodStr = init.method || "GET";
      Object.defineProperty(this, "method", {
        value: methodStr,
        writable: true,
        configurable: true,
        enumerable: true
      });

      const headersMap = init.headers || {};
      const lcHeaders = {};
      Object.entries(headersMap).forEach(([k, v]) => {
        lcHeaders[k.toLowerCase()] = v;
      });

      const headersObj = {
        get: (key) => {
          if (!key) return null;
          return lcHeaders[key.toLowerCase()] || null;
        },
        set: (key, val) => {
          if (!key) return;
          headersMap[key] = val;
          lcHeaders[key.toLowerCase()] = val;
        },
        append: (key, val) => {
          if (!key) return;
          headersMap[key] = val;
          lcHeaders[key.toLowerCase()] = val;
        },
        forEach: (cb) => Object.entries(headersMap).forEach(([k, v]) => cb(v, k)),
        entries: () => Object.entries(headersMap)[Symbol.iterator](),
        keys: () => Object.keys(headersMap)[Symbol.iterator](),
        values: () => Object.values(headersMap)[Symbol.iterator](),
        [Symbol.iterator]: () => Object.entries(headersMap)[Symbol.iterator](),
      };
      Object.defineProperty(this, "headers", {
        value: headersObj,
        writable: true,
        configurable: true,
        enumerable: true
      });

      Object.defineProperty(this, "body", {
        value: init.body,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    async json() {
      const txt = await this.text();
      return JSON.parse(txt);
    }
    async text() {
      if (!this.body) return "";
      if (typeof this.body === "string") return this.body;
      
      if (this.body.getReader) {
        const reader = this.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
        result += decoder.decode();
        return result;
      }
      
      if (typeof this.body === "object") {
        return JSON.stringify(this.body);
      }
      return String(this.body);
    }
  };
}

if (typeof global.Response === "undefined") {
  global.Response = class Response {
    constructor(body, init = {}) {
      Object.defineProperty(this, "body", {
        value: body,
        writable: true,
        configurable: true,
        enumerable: true
      });

      const statusVal = init.status || 200;
      Object.defineProperty(this, "status", {
        value: statusVal,
        writable: true,
        configurable: true,
        enumerable: true
      });

      const okVal = statusVal >= 200 && statusVal < 300;
      Object.defineProperty(this, "ok", {
        value: okVal,
        writable: true,
        configurable: true,
        enumerable: true
      });

      const headersMap = init.headers || {};
      const lcHeaders = {};
      Object.entries(headersMap).forEach(([k, v]) => {
        lcHeaders[k.toLowerCase()] = v;
      });

      const headersObj = {
        get: (key) => {
          if (!key) return null;
          return lcHeaders[key.toLowerCase()] || null;
        },
        set: (key, val) => {
          if (!key) return;
          headersMap[key] = val;
          lcHeaders[key.toLowerCase()] = val;
        },
        append: (key, val) => {
          if (!key) return;
          headersMap[key] = val;
          lcHeaders[key.toLowerCase()] = val;
        },
        forEach: (cb) => Object.entries(headersMap).forEach(([k, v]) => cb(v, k)),
        entries: () => Object.entries(headersMap)[Symbol.iterator](),
        keys: () => Object.keys(headersMap)[Symbol.iterator](),
        values: () => Object.values(headersMap)[Symbol.iterator](),
        [Symbol.iterator]: () => Object.entries(headersMap)[Symbol.iterator](),
      };
      Object.defineProperty(this, "headers", {
        value: headersObj,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    async json() {
      const txt = await this.text();
      return JSON.parse(txt);
    }
    async text() {
      if (!this.body) return "";
      if (typeof this.body === "string") return this.body;
      
      if (this.body.getReader) {
        const reader = this.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
        result += decoder.decode();
        return result;
      }
      
      if (typeof this.body === "object") {
        return JSON.stringify(this.body);
      }
      return String(this.body);
    }
    static json(data, init = {}) {
      return new Response(data, init);
    }
  };
}
