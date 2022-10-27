<img width="1167" alt="dnum" src="https://user-images.githubusercontent.com/36158/185436996-6178ce8f-8b86-4ac2-b655-12f776743e13.png">

[![npm version](https://badgen.net/npm/v/dnum)](https://www.npmjs.com/package/dnum) [![bundle size](https://img.shields.io/bundlephobia/minzip/dnum)](https://bundlephobia.com/result?p=dnum) [![License](https://badgen.net/github/license/bpierre/dnum)](https://github.com/bpierre/dnum/blob/main/LICENSE)

dnum (Decimal Numbers) is a library that allows to operate on large numbers represented as a pair composed of a [`BigInt`](https://developer.mozilla.org/en-US/docs/Glossary/BigInt) for the value, and a [`Number`](https://developer.mozilla.org/en-US/docs/Glossary/Number) for the decimals.

It is not a replacement for libraries such as [decimal.js](https://mikemcl.github.io/decimal.js/) or the native `BigInt` operators (which it uses internally). Instead, dnum focuses on a small (~1kb) set of utilities focused around the `Dnum` data structure, allowing to safely operate on numbers represented in various decimal precisions.

The `Dnum` data structure is a simple array with two entries, or tuple: a `BigInt` for the value, and a `Number` for the decimals. This is how it looks in TypeScript:

```ts
type Dnum = [value: bigint, decimals: number];
```

## Install

```sh
npm install --save dnum
pnpm add dnum
yarn add dnum
```

## Example

dnum can be useful to manipulate different currencies together, so let’s imagine a situation where you have the price of a given [token](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) token TKN expressed in [ETH](https://ethereum.org/en/developers/docs/intro-to-ether/), which you received it as a string to avoid any precision issue:

```ts
let tknPriceInEth = "17.30624293209842";
```

And you have the price of ETH in USD, as a number this time:

```ts
let ethPriceInUsd = 1002.37;
```

Finally, you have a certain quantity of TKN to be displayed, as a BigInt:

```ts
let tknQuantity = 1401385000000000000000n; // 1401.385 with 18 decimals precision
```

You want to display the USD value of `tknQuantity`, which would normally require to:

- Parse the numbers correctly (without using `parseInt()` / `parseFloat()` to avoid precision loss).
- Convert everything into BigInt values with an identical decimals precision.
- Multiply the numbers and get the result.
- Convert it into a string to format it − without using `Number` since you’d lose precision.

dnum can do all of this for you:

```ts
// No need to convert anything, you can just multiply different formats of decimal numbers:
let tknPriceInUsd = dnum.multiply(tknPriceInEth, ethPriceInUsd);

// A Dnum is just a two entries array (or tuple): [value: bigint, decimals: number]
let tknQuantityInUsd = dnum.multiply([tknQuantity, 18], tknPriceInUsd);

dnum.format(tknQuantityInUsd, 2); // $24,310,188.17
```

You can play with this example [on CodeSandbox](https://codesandbox.io/s/dnum-intro-qljzi6?file=/src/index.ts).

## API

### Types

```ts
type Dnum = [value: bigint, decimals: number];
type Numberish = string | number | bigint | Dnum;
```

### format(value, options)

Formats the number for display purposes.

| Name                    | Description                                                                                                                                           | Type     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `value`                 | The value to format.                                                                                                                                  | `Dnum`   |
| `options.digits`        | Number of digits to display. Setting `options` to a number acts as an alias for this option. Defaults to the number of decimals in the passed `Dnum`. | `number` |
| `options.compact`       | Compact formatting (e.g. “1,000” becomes “1K”).                                                                                                       | `object` |
| `options.trailingZeros` | Add trailing zeros if any, following the number of digits.                                                                                            | `object` |
| returns                 | Formatted string.                                                                                                                                     | `string` |

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

| Name           | Description                             | Type             |
| -------------- | --------------------------------------- | ---------------- |
| `valueToParse` | Value to convert into a `Dnum`          | `Numberish`      |
| `decimals`     | Number of decimals (or `true` for auto) | `number \| true` |
| returns        | Converted value                         | `Dnum`           |

#### Example

```ts
// Parses a number expressed as a string or number
let amount = dnum.from("17.30624", 18);

// amount equals [17306240000000000000n, 18]
```

### add(value1, value2, decimals)

Adds two values together, regardless of their decimals. `decimals` correspond to the decimals desired in the result.

| Name                  | Description                                   | Type        |
| --------------------- | --------------------------------------------- | ----------- |
| `value1`              | First value to add                            | `Numberish` |
| `value2`              | Second value to add                           | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to value1 decimals) | `number`    |
| returns               | Result                                        | `Dnum`      |

### subtract(value1, value2, decimals)

Subtract a value from another one, regardless of their decimals. `decimals` correspond to the decimals desired in the result.

| Name                  | Description                                   | Type        |
| --------------------- | --------------------------------------------- | ----------- |
| `value1`              | First value to add                            | `Numberish` |
| `value2`              | Second value to add                           | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to value1 decimals) | `number`    |
| returns               | Result                                        | `Dnum`      |

Alias: `sub()`

### multiply(value1, value2, decimals)

Multiply two values together, regardless of their decimals. `decimals` correspond to the decimals desired in the result.

| Name                  | Description                                   | Type        |
| --------------------- | --------------------------------------------- | ----------- |
| `value1`              | First value to multiply                       | `Numberish` |
| `value2`              | Second value to multiply                      | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to value1 decimals) | `number`    |
| returns               | Result                                        | `Dnum`      |

Alias: `mul()`

#### Example

```ts
let ethPriceUsd = [100000n, 2]; // 1000 USD
let tokenPriceEth = [570000000000000000, 18]; // 0.57 ETH

let tokenPriceUsd = dnum.multiply(tokenPriceEth, ethPriceUsd, 2); // 570 USD

// tokenPriceUsd equals [57000, 2]
```

### divide(value1, value2, decimals)

Divide a value by another one, regardless of their decimals. `decimals` correspond to the decimals desired in the result.

| Name                  | Description                                   | Type        |
| --------------------- | --------------------------------------------- | ----------- |
| `value1`              | Dividend                                      | `Numberish` |
| `value2`              | Divisor                                       | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to value1 decimals) | `number`    |
| returns               | Result value                                  | `Dnum`      |

Alias: `div()`

#### Example

```ts
let ethPriceUsd = [100000n, 2]; // 1000 USD
let tokenPriceUsd = [57000, 2]; // 570 USD

let tokenPriceEth = dnum.divide(tokenPriceUsd, ethPriceUsd, 18); // 0.57 ETH

// tokenPriceEth equals [570000000000000000, 18]
```

### toNumber(value, options)

Converts the `Dnum` data structure into a `Number`. [This will result in a loss of precision](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_encoding) depending on how large the number is.

| Name     | Description                           | Type     |
| -------- | ------------------------------------- | -------- |
| `value`  | The number to convert into a `Number` | `Dnum`   |
| `digits` | The number of digits to round to.     | `Number` |
| returns  | Result value                          | `Number` |

```ts
let value = [123456789000000000000000n, 18];

toNumber(value); // 123456.789
toNumber(value, 1); // 123456.8
```

### toJSON(value)

Converts the `Dnum` data structure into a JSON-compatible string. This function is provided because `JSON.stringify()` doesn’t work with `BigInt` data types.

| Name    | Description                       | Type     |
| ------- | --------------------------------- | -------- |
| `value` | The number to convert into a JSON | `Dnum`   |
| returns | Result value                      | `string` |

```ts
let json = toJSON([123456789000000000000n, 18]);

// json == "[\"123456789000000000000\", 18]";
```

### fromJSON(value)

Converts the string resulting from `toJSON()` back into a `Dnum`.

| Name    | Description                                    | Type     |
| ------- | ---------------------------------------------- | -------- |
| `value` | The string value to convert back into a `Dnum` | `string` |
| returns | Result value                                   | `Dnum`   |

```ts
let dnum = fromJSON("[\"123456789000000000000\", 18]");

// dnum == [123456789000000000000n, 18]
```

### setDecimals(value, decimals)

Return a new `Dnum` with a different amount of decimals. The value will reflect this change so that the represented number stays the same.

| Name       | Description                                    | Type     |
| ---------- | ---------------------------------------------- | -------- |
| `value`    | The number from which decimals will be changed | `Dnum`   |
| `decimals` | New number of decimals                         | `number` |
| returns    | Result value                                   | `Dnum`   |

Note: `from(value, decimals)` can also be used instead.

## Tree shaking

To make use of tree shaking, named exports are also provided:

```ts
import { format, from } from "dnum";
```

## Acknowledgements

- [ethers](https://ethers.org/), in particular its [`parseFixed()`](https://github.com/ethers-io/ethers.js/blob/8b62aeff9cce44cbd16ff41f8fc01ebb101f8265/packages/bignumber/src.ts/fixednumber.ts#L70) function.
- [token-amount](https://github.com/aragon/token-amount) which was an attempt at solving a similar problem.
