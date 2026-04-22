var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  inlineObfuscate: () => inlineObfuscate
});
module.exports = __toCommonJS(index_exports);
/* *******************************************************
 * ghostmail
 *
 * ~ All the secrets of the world worth knowing
 *                       are hiding in plain sight.
 *                              — Robin Sloan
 *
 * @license
 *
 * Apache-2.0
 *
 * Copyright 2018-2025 Alex Stevovich
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @meta
 *
 * package_name: ghostmail
 * file_name: src/index.js
 * purpose: Core functionality and exports combined.
 *
 * @system
 *
 * generated_on: 2025-03-08T21:53:05.700Z
 * certified_version: 1.1.2
 * file_uuid: 27179531-5065-4319-8aff-7ce48db28dbe
 * file_size: 7588 bytes
 * file_hash: 991c9770ce2ce06d8b364c617ae70cc4e5fcc5cb75e25d575f4c06d2cfe2343e
 * mast_hash: 052328d3f3e8e27fd74e9caf1df42cbdf3ba07c642aee819fb64c819b19c0ce5
 * generated_by: preamble on npm!
 *
 * [Preamble Metadata]
 ******************************************************* */
function getRandomFromSeed(seed, index, min, max) {
  let value = (seed ^ index * 73244475) >>> 0;
  value = (value ^ value >> 16) & 4294967295;
  return min + value % (max - min + 1);
}
function getDerivedRandomHrefViableEscapeCode(seed, index) {
  return ["&#8203;", "&#8288;"][getRandomFromSeed(seed, index, 0, 1)];
}
function obfuscateCharacter(char, seed, index) {
  const alternatives = {
    "@": ["&#64;", "&#x40;", "&#x00040;"],
    ".": ["&#46;", "&#x2E;", "&#x0002E;"]
  };
  return char in alternatives ? alternatives[char][getRandomFromSeed(seed, index, 0, alternatives[char].length - 1)] : `&#${char.charCodeAt(0)};`;
}
function zwsEncodeArray(email, seed, options = {}) {
  const addZeroWidthSpaces = options.addZeroWidthSpaces ?? true;
  return email.split("").map((char, index) => {
    let encoded = obfuscateCharacter(char, seed, index);
    return addZeroWidthSpaces ? encoded + getDerivedRandomHrefViableEscapeCode(seed, index) : encoded;
  });
}
function seededRandom(seed) {
  seed = seed * 48271 % 2147483647;
  return seed / 2147483647;
}
function deriveFromSeed(seed, min, max) {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}
function inlineObfuscate(email, seed, options = {}) {
  if (typeof email !== "string" || email.indexOf("@") === -1) {
    throw new Error("Invalid email format");
  }
  let encodedArray = zwsEncodeArray(email, seed, options);
  const atIndex = email.indexOf("@");
  const posBeforeAt = deriveFromSeed(seed, 1, atIndex - 1);
  const posAfterAt = deriveFromSeed(seed + 1, atIndex + 1, email.length - 1);
  const classBeforeAt = `${deriveFromSeed(seed, 1e5, 999999)}`;
  const classAfterAt = `${deriveFromSeed(seed + 2, 1e5, 999999)}`;
  const hiddenCharBeforeAt = `&#${deriveFromSeed(seed, 33, 126)};`;
  const hiddenCharAfterAt = `&#${deriveFromSeed(seed + 3, 33, 126)};`;
  let seedIncrementer = 0;
  function randomizeSpacing() {
    const value = getRandomFromSeed(seed, seedIncrementer++, 0, 2);
    return " ".repeat(value);
  }
  function generateStyle() {
    const displayOptions = ["block", "inline-block", "flex"];
    const randomDisplay = displayOptions[getRandomFromSeed(
      seed,
      seedIncrementer++,
      0,
      displayOptions.length - 1
    )];
    const hasExtraDisplay = getRandomFromSeed(seed, seedIncrementer++, 0, 1) === 1;
    return hasExtraDisplay ? `display:${randomizeSpacing()}${randomDisplay};${randomizeSpacing()}display:${randomizeSpacing()}none !important;` : `display:${randomizeSpacing()}none !important;`;
  }
  const styleBeforeAt = generateStyle();
  const styleAfterAt = generateStyle();
  function randomizeAttributes(seedOffset, className, style, hiddenChar) {
    const attributes = /* @__PURE__ */ new Map([
      ["class", `"${className}"`],
      ["aria-hidden", `"true"`],
      ["style", `"${style}"`]
    ]);
    const shuffled = [...attributes.entries()].sort(
      () => getRandomFromSeed(seedOffset, 0, -1, 1)
    );
    return `<span ${shuffled.map(([k, v]) => `${k}=${v}`).join(" ")}>${hiddenChar}</span>`;
  }
  encodedArray[posBeforeAt] += randomizeAttributes(
    seedIncrementer++,
    classBeforeAt,
    styleBeforeAt,
    hiddenCharBeforeAt
  );
  encodedArray[posAfterAt] += randomizeAttributes(
    seedIncrementer++,
    classAfterAt,
    styleAfterAt,
    hiddenCharAfterAt
  );
  return encodedArray.join("");
}
var index_default = inlineObfuscate;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  inlineObfuscate
});
