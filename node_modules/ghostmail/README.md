# GhostMail

> 
> _"All the secrets of the world worth knowing are hiding in plain sight."_
>
> — Robin Sloan
> 

Obfuscates inline HTML email addresses to protect them from bots and scrapers.

[![npm version](https://img.shields.io/npm/v/ghostmail)](https://www.npmjs.com/package/ghostmail) [![npm downloads](https://img.shields.io/npm/dt/ghostmail)](https://www.npmjs.com/package/ghostmail) [![license](https://img.shields.io/github/license/alexstevovich/ghostmail)](https://github.com/yourusername/ghostmail/blob/main/LICENSE) [![bundle size](https://img.shields.io/bundlephobia/minzip/ghostmail)](https://bundlephobia.com/package/ghostmail)

## Mission

**GhostMail** aims to provide the highest level of protection possible without introducing any friction for viewers.

#### Objectives

- The obfuscation must not alter the viewer experience in any way.
- No waiting, clicks, or CAPTCHAs should be required.
- Screen readers and accessibility tools should experience the email as though it were unobfuscated.

<br>

>
> *Disguise the payload. Disappear into the DOM \*\* *Vanishes\* \*\*
> 

<br>

#### Practical Limitations

There are inherent limits to what can be achieved within these constraints. Sophisticated tools and AI-powered scrapers may still extract email addresses. However, **GhostMail** provides a meaningful barrier against the most common low- to mid-level scrapers.

<br>

## Installation

#### NPM

```
npm install ghostmail
```

#### Yarn

```sh
yarn add ghostmail
```

## Features

- **Bot-resistant obfuscation** using **zero-width spaces, HTML entities, and hidden spans**
- **No impact on accessibility** (screen readers, copy-pasting, and visibility remain unaffected)
- **No JavaScript required** – though it's recommended to assemble email addresses at runtime for clickable links.
- **No user friction** – the email remains fully readable

<br>
    
> 
> *Strike swift. Encode deep. Leave nothing readable.*
>

<br>

## Usage

### **Basic Email Obfuscation**

```js
import ghostmail from 'ghostmail';

const email = 'example.email@gmail.com';
const obfuscatedEmail = ghostmail(email, 987654);

console.log(obfuscatedEmail);
/*
&#101;&#8288;&#120;&#8288;&#97;&#8203;&#109;&#8203;<span class="280381" aria-hidden="true" style="display:none !important;">&#51;</span>&#112;&#8288;&#108;&#8203;&#101;&#8203;&#x2E;&#8288;&#101;&#8288;&#109;&#8203;&#97;&#8288;&#105;&#8288;&#108;&#8203;&#x00040;&#8288;&#103;&#8288;&#109;&#8203;<span style="display: none !important;" aria-hidden="true" class="280421">&#51;</span>&#97;&#8203;&#105;&#8288;&#108;&#8203;&#x2E;&#8203;&#99;&#8288;&#111;&#8203;&#109;&#8203;
*/
```

### **Parameters:**

- `email` (**string**) – The email address to obfuscate.
- `seed` (**number**) – A number for deterministic obfuscation.

The seed randomizes the obfuscation pattern to make detection harder while ensuring consistency.

The same seed and email will always produce the same obfuscation, which is helpful for consistent builds and caching.

<br>

> 
> They cannot spam what they cannot see.
> 

<br>

## How It Works

GhostMail obfuscates email addresses using:

1.  **Zero-Width Spaces (ZWS):** Invisible to users but disrupts basic text extraction.
2.  **HTML Entity Encoding:** Converts characters into encoded entities (`&#64;`, `&#46;`) to break simple regex-based scrapers.
3.  **Hidden Elements (`display: none;`):** Inserts invisible junk to further confuse bots.
4.  **Deterministic Seed-Based Obfuscation:** Ensures randomized but consistent obfuscation patterns.

These techniques make it significantly harder for automated scrapers to extract an email while keeping the address readable and copyable for real users.

## Warning

I’ve done significant testing but have not received enough thorough feedback to test all environments.

There's a large range of devices and methods for enabling accessibility and it's hard to be aware of all of them. I will swiftly address any that are reported to me in regards to these.

## Limitations

GhostMail offers a reasonable level of obfuscation, but it is not a foolproof solution. Consider the following:

- **It cannot stop all bots and scrapers.** Sophisticated tools and AI-based methods can bypass any obfuscation technique.
- **It does not eliminate spam.** Some scrapers will still manage to extract addresses, especially if they employ advanced text analysis.
- **It is not a replacement for CAPTCHAs or email relay services.** GhostMail provides a barrier against common scraping methods but is not a security solution.

---

## Project Links

I use GitHub as the primary public development spot:

[https://github.com/alexstevovich/ghostmail](https://github.com/alexstevovich/ghostmail)

<br>

> 
> ### _Every char a ghost.... every address a myth._
> 

<br>

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
