# dnum

[![npm version](https://badgen.net/npm/v/dnum)](https://www.npmjs.com/package/dnum) [![bundle size](https://badgen.net/bundlephobia/minzip/dnum@latest)](https://bundlephobia.com/result?p=dnum) [![License](https://badgen.net/github/license/bpierre/dnum)](https://github.com/bpierre/dnum/blob/main/LICENSE)

dnum (Decimal Numbers) is a library that allows to operate on large numbers represented as a pair composed of a [`BigInt`](https://developer.mozilla.org/en-US/docs/Glossary/BigInt) for the value, and a [`Number`](https://developer.mozilla.org/en-US/docs/Glossary/Number) for the decimals.

It is not a replacement for libraries such as [decimal.js](https://mikemcl.github.io/decimal.js/) or the native `BigInt` operators. Instead, dnum focuses on a small set of utilities that allow to manipulate numbers represented in this way.

## Usage

The data structure is a simple array with two entries: a `BigInt` representing the value, and a `Number` representing the decimals. We’ll call it `Dnum`, and this is how it is represented in TypeScript:

```ts
type Dnum = [value: bigint, decimals: number];
```

```ts
import dnum from "dnum";

// Create a Big Integer With Decimals from strings
let amount1 = dnum.from("17.30624", 18); // [17306240000000000000n, 18]

// Or numbers
let amount2 = dnum.from(3.4, 2); // [340, 2]

// You don’t need dnum.from() if you already know the value and decimals
let amount3 = [140138500000n, 8]; // represents 1401.385 with 8 decimals precision

// Format with 2 digits
dnum.format(amount1, 2); // "17.31"

// Format with 4 digits while keeping the trailing zeros
dnum.format(amount2, 4, { trailingZeros: true }); // "3.4000"

// Compact formatting
dnum.format(amount3, 2, { compact: true }); // "1.4K"
```

## Install

npm:

```sh
npm install --save dnum
```

pnpm:

```sh
pnpm add dnum
```

yarn:

```sh
yarn add dnum
```

## API

### format(value, options)

Formats the number for display purposes.

| Name                    | Description                                                                                                                                               | Type       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `value`                 | The value to format.                                                                                                                                      | `Dnum` |
| `options.digits`        | Number of digits to display. Setting `options` to a number acts as an alias for this option. Defaults to the number of decimals in the passed `Dnum`. | `number`   |
| `options.compact`       | Compact formatting (e.g. “1,000” becomes “1K”).                                                                                                           | `object`   |
| `options.trailingZeros` | Add trailing zeros if any, following the number of digits.                                                                                                | `object`   |
| returns                 | Formatted string.                                                                                                                                         | `string`   |

#### Example

```ts
let amount = [123456789000000000000000n, 18];

// If no digits are provided, the digits correspond to the decimals
dnum.format(amount); // 123,456.789

// options.digits
dnum.format(amount, { digits: 2 }); // 123,456.79
dnum.format(amount, 2); // (alias)

// options.compact
dnum.format(amount, { compact: true }); // 123K

// options.trailingZeros
dnum.format(amount, { digits: 6, trailingZeros: true }); // 123,456.789000
```

### from(valueToParse, decimals)

Parse a value and convert it into a `Dnum`.

| Name           | Description                        | Type                         |
| -------------- | ---------------------------------- | ---------------------------- |
| `valueToParse` | Value to convert into a `Dnum` | `string \| number \| bigint` |
| `decimals`     | Number of decimals                 | `number`                     |
| returns        | Converted value                    | `Dnum`                   |

#### Example

```ts
// Parses a number expressed as a string or number
let amount = dnum.from("17.30624", 18); // [17306240000000000000n, 18]
```

### multiply(value1, value2, decimals)

Multiply two values together, regardless of their decimals. `decimals` correspond to the decimals desired in the result.

| Name       | Description                       | Type       |
| ---------- | --------------------------------- | ---------- |
| `value1`   | First value to multiply           | `Dnum` |
| `value2`   | Second value to multiply          | `Dnum  |
| `decimals` | Number of decimals for the result | `number`   |
| returns    | Result value                      | `Dnum` |

#### Example

```ts
let ethPriceUsd = [100000n, 2]; // 1000 USD
let tokenPriceEth = [570000000000000000, 18]; // 0.57 ETH

let tokenPriceUsd = dnum.multiply(tokenPriceEth, ethPriceUsd, 2); // 570 USD => [57000, 2]
```

### divide(value1, value2, decimals)

Divide a value by another one, regardless of their decimals. `decimals` correspond to the decimals desired in the result.

| Name       | Description                       | Type       |
| ---------- | --------------------------------- | ---------- |
| `value1`   | Dividend                          | `Dnum` |
| `value2`   | Divisor                           | `Dnum  |
| `decimals` | Number of decimals for the result | `number`   |
| returns    | Result value                      | `Dnum` |

#### Example

```ts
let ethPriceUsd = [100000n, 2]; // 1000 USD
let tokenPriceUsd = [57000, 2]; // 570 USD

let tokenPriceEth = dnum.divide(tokenPriceUsd, ethPriceUsd, 18); // 0.57 ETH => [570000000000000000, 18]
```

### setDecimals(value, decimals)

Return a new `Dnum` with a different amount of decimals. The value will reflect this change so that the represented number stays the same.

| Name       | Description                                    | Type       |
| ---------- | ---------------------------------------------- | ---------- |
| `value`    | The number from which decimals will be changed | `Dnum` |
| `decimals` | New number of decimals                         | `number`   |
| returns    | Result value                                   | `Dnum` |

## Tree shaking

To make use of tree shaking, named exports are also provided:

```ts
import { format, from } from "dnum";
```

## Acknowledgements

- [ethers](https://ethers.org/), in particular its [`parseFixed()`](https://github.com/ethers-io/ethers.js/blob/8b62aeff9cce44cbd16ff41f8fc01ebb101f8265/packages/bignumber/src.ts/fixednumber.ts#L70) function.
- [token-amount](https://github.com/aragon/token-amount) which was an attempt at solving a similar problem.
