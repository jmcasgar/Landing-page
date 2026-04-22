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
/**
 * Generates a pseudo-random number based on a seed.
 *
 * @param {number} seed - The seed value.
 * @param {number} index - The index to introduce variation.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {number} A pseudo-random number within the specified range.
 */
function getRandomFromSeed(seed, index, min, max) {
    let value = (seed ^ (index * 0x45d9f3b)) >>> 0;
    value = (value ^ (value >> 16)) & 0xffffffff;

    return min + (value % (max - min + 1));
}

/**
 * Generates a zero-width space escape code for use in obfuscation.
 *
 * @param {number} seed - The seed value.
 * @param {number} index - The index used for variation.
 * @returns {string} A zero-width space escape code.
 */
function getDerivedRandomHrefViableEscapeCode(seed, index) {
    return ['&#8203;', '&#8288;'][getRandomFromSeed(seed, index, 0, 1)];
}

/**
 * Converts a character into an obfuscated HTML entity.
 *
 * @param {string} char - The character to obfuscate.
 * @param {number} seed - The seed value for randomness.
 * @param {number} index - The index of the character.
 * @returns {string} An obfuscated representation of the character.
 */
function obfuscateCharacter(char, seed, index) {
    const alternatives = {
        '@': ['&#64;', '&#x40;', '&#x00040;'],
        '.': ['&#46;', '&#x2E;', '&#x0002E;'],
    };

    return char in alternatives
        ? alternatives[char][
              getRandomFromSeed(seed, index, 0, alternatives[char].length - 1)
          ]
        : `&#${char.charCodeAt(0)};`;
}

/**
 * Encodes an email into an array of obfuscated characters.
 *
 * @param {string} email - The email address to obfuscate.
 * @param {number} seed - The seed for deterministic randomness.
 * @param {{ addZeroWidthSpaces?: boolean }} [options={}] - Configuration options.
 * @returns {string[]} The obfuscated email as an array of encoded characters.
 */
function zwsEncodeArray(email, seed, options = {}) {
    const addZeroWidthSpaces = options.addZeroWidthSpaces ?? true;

    return email.split('').map((char, index) => {
        let encoded = obfuscateCharacter(char, seed, index);

        return addZeroWidthSpaces
            ? encoded + getDerivedRandomHrefViableEscapeCode(seed, index)
            : encoded;
    });
}

/**
 * Generates a deterministic pseudo-random number using a linear congruential generator.
 *
 * @param {number} seed - The seed value.
 * @returns {number} A pseudo-random number between 0 and 1.
 */
function seededRandom(seed) {
    seed = (seed * 48271) % 0x7fffffff;

    return seed / 0x7fffffff;
}

/**
 * Derives a number within a specified range using a seeded random generator.
 *
 * @param {number} seed - The seed value.
 * @param {number} min - The minimum range.
 * @param {number} max - The maximum range.
 * @returns {number} A derived number within the specified range.
 */
function deriveFromSeed(seed, min, max) {
    return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

/**
 * Obfuscates an email by injecting invisible spans and encoding characters.
 *
 * @param {string} email - The email address to obfuscate.
 * @param {number} seed - The seed for deterministic randomness.
 * @param {{ addZeroWidthSpaces?: boolean }} [options={}] - Configuration options.
 * @returns {string} The obfuscated email as an inline-safe HTML string.
 * @throws {Error} If the email format is invalid.
 */
export function inlineObfuscate(email, seed, options = {}) {
    if (typeof email !== 'string' || email.indexOf('@') === -1) {
        throw new Error('Invalid email format');
    }

    let encodedArray = zwsEncodeArray(email, seed, options);

    const atIndex = email.indexOf('@');
    const posBeforeAt = deriveFromSeed(seed, 1, atIndex - 1);
    const posAfterAt = deriveFromSeed(seed + 1, atIndex + 1, email.length - 1);

    const classBeforeAt = `${deriveFromSeed(seed, 100000, 999999)}`;
    const classAfterAt = `${deriveFromSeed(seed + 2, 100000, 999999)}`;

    const hiddenCharBeforeAt = `&#${deriveFromSeed(seed, 33, 126)};`;
    const hiddenCharAfterAt = `&#${deriveFromSeed(seed + 3, 33, 126)};`;

    let seedIncrementer = 0;

    function randomizeSpacing() {
        const value = getRandomFromSeed(seed, seedIncrementer++, 0, 2);

        return ' '.repeat(value);
    }

    function generateStyle() {
        const displayOptions = ['block', 'inline-block', 'flex'];
        const randomDisplay =
            displayOptions[
                getRandomFromSeed(
                    seed,
                    seedIncrementer++,
                    0,
                    displayOptions.length - 1,
                )
            ];
        const hasExtraDisplay =
            getRandomFromSeed(seed, seedIncrementer++, 0, 1) === 1;

        return hasExtraDisplay
            ? `display:${randomizeSpacing()}${randomDisplay};${randomizeSpacing()}display:${randomizeSpacing()}none !important;`
            : `display:${randomizeSpacing()}none !important;`;
    }

    const styleBeforeAt = generateStyle();
    const styleAfterAt = generateStyle();

    /**
     * Generates a randomized hidden span element.
     *
     * @param {number} seedOffset - The seed offset for randomization.
     * @param {string} className - The class name for the span.
     * @param {string} style - The inline styles for the span.
     * @param {string} hiddenChar - The hidden character to insert.
     * @returns {string} An HTML string representing the hidden span.
     */
    function randomizeAttributes(seedOffset, className, style, hiddenChar) {
        const attributes = new Map([
            ['class', `"${className}"`],
            ['aria-hidden', `"true"`],
            ['style', `"${style}"`],
        ]);

        const shuffled = [...attributes.entries()].sort(() =>
            getRandomFromSeed(seedOffset, 0, -1, 1),
        );

        return `<span ${shuffled.map(([k, v]) => `${k}=${v}`).join(' ')}>${hiddenChar}</span>`;
    }

    encodedArray[posBeforeAt] += randomizeAttributes(
        seedIncrementer++,
        classBeforeAt,
        styleBeforeAt,
        hiddenCharBeforeAt,
    );

    encodedArray[posAfterAt] += randomizeAttributes(
        seedIncrementer++,
        classAfterAt,
        styleAfterAt,
        hiddenCharAfterAt,
    );

    return encodedArray.join('');
}

export default inlineObfuscate;
