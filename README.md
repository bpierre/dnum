<img alt="dnum: small library for big decimal numbers" src="https://user-images.githubusercontent.com/36158/202865124-a4020c0b-5ad7-4e66-aaf4-a5be415a84f3.png">

<p align=center><a href="https://www.npmjs.com/package/dnum"><img src="https://badgen.net/npm/v/dnum" alt="npm version"></a> <a href="https://bundlejs.com/?q=dnum"><img src="https://deno.bundlejs.com/badge?q=dnum" alt="bundle size"></a> <a href="https://github.com/bpierre/dnum/blob/main/LICENSE"><img src="https://badgen.net/github/license/bpierre/dnum" alt="License"></a></p>

dnum provides a [small](https://bundlejs.com/?bundle&q=dnum) set of utilities designed for the manipulation of large numbers. It provides useful features for everyday apps, such as formatting and math functions. Numbers are represented as a pair composed of a value ([`BigInt`](https://developer.mozilla.org/en-US/docs/Glossary/BigInt)) and a decimal precision. This structure allows to maintain the number precision while offering a great flexibility.

```ts
type Dnum = [value: bigint, decimals: number];
```

## Usage

```ts
import * as dn from "dnum";

let a = dn.from(2, 18); // the number 2 followed by 18 decimals
let a = [2000000000000000000n, 18]; // equivalent to the previous line

let b = dn.from("870983127.93887"); // dn.from() can parse strings, numbers, bigint and more

let c = dn.multiply(a, b); // returns [1741966255877740000000000000n, 18]

console.log(
  dn.format(a), // "2"
  dn.format(b, 2), // "870,983,127.94"
  dn.format(c, 2), // "1,741,966,255.88"
  dn.format(b, { compact: true }), // "1.7B"
);
```

## Install

```sh
npm install --save dnum
pnpm add dnum
yarn add dnum
```

## TL;DR

dnum might be a good option for your project if:

- Your numbers are represented as value + decimals pairs.
- You need to format large numbers for UI purposes.
- You want to keep your big numbers library small.
- You want a simple, straightforward data structure.

## Example

dnum can be used to perform math operations on currency values. Let’s consider a scenario where you have the price of a specific [token](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) known as TKN, expressed in [ETH](https://ethereum.org/en/developers/docs/intro-to-ether/), received as a string to prevent potential precision issues:

```ts
let tknPriceInEth = "17.30624293209842";
```

And you received the price of 1 ETH in USD from a different source, as a JavaScript number:

```ts
let ethPriceInUsd = 1002.37;
```

Finally, your app has a specific quantity of TKN to be displayed, represented as a BigInt with an implied 18 decimals precision:

```ts
let tknQuantity = 1401385000000000000000n; // 1401.385 (18 decimals precision)
```

You want to display the USD value of `tknQuantity`. This would normally require to:

- Parse the numbers correctly (without using `parseInt()` / `parseFloat()` to avoid precision loss).
- Convert everything into BigInt values with an identical decimals precision.
- Multiply the numbers.
- Convert the resulting BigInt into a string and format it for display purposes, without `Intl.NumberFormat` since it would cause precision loss.

dnum can do all of this for you:

```ts
let tknPriceInEth = "17.30624293209842";
let ethPriceInUsd = 1002.37;
let tknQuantity = 1401385000000000000000n; // 1401.385 (18 decimals precision)

// dnum function parameters accept various ways to represent decimal numbers.
let tknPriceInUsd = dnum.multiply(tknPriceInEth, ethPriceInUsd);

let tknQuantityInUsd = dnum.multiply(
  // Here we only attach the 18 decimals precision with the bigint value,
  // which corresponds to the Dnum type: [value: bigint, decimals: number].
  // You can pass this structure anywhere dnum expects a value, and this is
  // also what most dnum functions return.
  [tknQuantity, 18],
  tknPriceInUsd,
);

// We can now format the obtained result, rounding its decimals to 2 digits:
dnum.format(tknQuantityInUsd, 2); // $24,310,188.17
```

You can play with this example [on CodeSandbox](https://codesandbox.io/s/dnum-intro-qljzi6?file=/src/index.ts).

## API

### Types

```ts
type Dnum = [value: bigint, decimals: number];
type Numberish = string | number | bigint | Dnum;
```

### `format(value, options)`

Formats the number for display purposes.

| Name                       | Description                                                                                                                                                                                                                                  | Type                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `value`                    | The value to format.                                                                                                                                                                                                                         | `Dnum`                                                        |
| `options.digits`           | Number of digits to display. Setting `options` to a number acts as an alias for this option (see example below). Defaults to the number of decimals in the `Dnum` passed to `value`.                                                         | `number`                                                      |
| `options.compact`          | Compact formatting (e.g. “1,000” becomes “1K”).                                                                                                                                                                                              | `boolean`                                                     |
| `options.trailingZeros`    | Add trailing zeros if any, following the number of digits.                                                                                                                                                                                   | `boolean`                                                     |
| `options.locale`           | The locale used to format the number.                                                                                                                                                                                                        | `string`                                                      |
| `options.decimalsRounding` | Method used to round to `digits` decimals (defaults to `"ROUND_HALF"`).                                                                                                                                                                      | `"ROUND_HALF" \| "ROUND_UP" \| "ROUND_DOWN"`                  |
| `options.signDisplay`      | When to display the sign for the number. [Follows the same rules as `Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#signdisplay). Defaults to `"auto"`. | `"auto" \| "always" \| "exceptZero" \| "negative" \| "never"` |
| returns                    | Formatted string.                                                                                                                                                                                                                            | `string`                                                      |

#### Example

```ts
let amount = [123456789000000000000000n, 18];

// If no digits are provided, the digits correspond to the decimals
dnum.format(amount); // 123,456.789

// options.digits
dnum.format(amount, { digits: 2 }); // 123,456.79
dnum.format(amount, 2); // 123,456.79 (alias for { digits: 2 })

// options.compact
dnum.format(amount, { compact: true }); // 123K

// options.trailingZeros
dnum.format(amount, { digits: 6, trailingZeros: true }); // 123,456.789000
```

### `from(valueToParse, decimals)`

Parse a value and convert it into a `Dnum`. The passed value can be a string, a number, a bigint, or even a `Dnum` − which can be useful to change its decimals.

| Name                  | Description                                      | Type             |
| --------------------- | ------------------------------------------------ | ---------------- |
| `valueToParse`        | Value to convert into a `Dnum`                   | `Numberish`      |
| `decimals` (optional) | Number of decimals (defaults to `true` for auto) | `number \| true` |
| returns               | Converted value                                  | `Dnum`           |

#### Example

```ts
// Parses a number expressed as a string or number
let amount = dnum.from("17.30624", 18);

// amount equals [17306240000000000000n, 18]
```

### `add(value1, value2, decimals)`

Adds two values together, regardless of their decimals. `decimals` correspond to the decimals desired in the result.

| Name                  | Description                                     | Type        |
| --------------------- | ----------------------------------------------- | ----------- |
| `value1`              | First value to add                              | `Numberish` |
| `value2`              | Second value to add                             | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to `value1` decimals) | `number`    |
| returns               | Result                                          | `Dnum`      |

### `subtract(value1, value2, decimals)`

Subtracts the second value from the first one, regardless of their decimals. decimals correspond to the decimals desired in the result.

| Name                  | Description                                     | Type        |
| --------------------- | ----------------------------------------------- | ----------- |
| `value1`              | Value from which `value2` is subtracted         | `Numberish` |
| `value2`              | Value to subtract from `value1`                 | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to `value1` decimals) | `number`    |
| returns               | Result                                          | `Dnum`      |

Alias: `sub()`

### `multiply(value1, value2, optionsOrDecimals)`

Multiply two values together, regardless of their decimals. `options.decimals` correspond to the decimals desired in the result.

| Name                          | Description                                                                                                         | Type        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- |
| `value1`                      | First value to multiply                                                                                             | `Numberish` |
| `value2`                      | Second value to multiply                                                                                            | `Numberish` |
| `options.decimals` (optional) | Results decimals (defaults to `value1` decimals). Setting `options` to a `number` acts as an alias for this option. | `Decimals`  |
| `options.rounding` (optional) | How to round round results (defaults to `"ROUND_HALF"`)                                                             | `Rounding`  |
| returns                       | Result                                                                                                              | `Dnum`      |

Alias: `mul()`

#### Example

```ts
let ethPriceUsd = [100000n, 2]; // 1000 USD
let tokenPriceEth = [570000000000000000, 18]; // 0.57 ETH

let tokenPriceUsd = dnum.multiply(tokenPriceEth, ethPriceUsd, 2); // 570 USD

// tokenPriceUsd equals [57000, 2]
```

### `divide(value1, value2, optionsOrDecimals)`

Divide a value by another one, regardless of their decimals. `options.decimals` correspond to the decimals desired in the result.

| Name                          | Description                                                                                                         | Type        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- |
| `value1`                      | Dividend                                                                                                            | `Numberish` |
| `value2`                      | Divisor                                                                                                             | `Numberish` |
| `options.decimals` (optional) | Results decimals (defaults to `value1` decimals). Setting `options` to a `number` acts as an alias for this option. | `Decimals`  |
| `options.rounding` (optional) | How to round round results (defaults to `"ROUND_HALF"`)                                                             | `Rounding`  |
| returns                       | Result                                                                                                              | `Dnum`      |

Alias: `div()`

#### Example

```ts
let ethPriceUsd = [100000n, 2]; // 1000 USD
let tokenPriceUsd = [57000, 2]; // 570 USD

let tokenPriceEth = dnum.divide(tokenPriceUsd, ethPriceUsd, 18); // 0.57 ETH

// tokenPriceEth equals [570000000000000000, 18]
```

### `remainder(value1, value2, decimals)`

Equivalent to [the `%` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder): calculate the remainder left over when one operand is divided by a second operand.

| Name                  | Description                                     | Type        |
| --------------------- | ----------------------------------------------- | ----------- |
| `value1`              | Dividend                                        | `Numberish` |
| `value2`              | Divisor                                         | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to `value1` decimals) | `number`    |
| returns               | Result value                                    | `Dnum`      |

Alias: `rem()`

### `abs(value, decimals)`

Equivalent to the [`Math.abs()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs) function: it returns the absolute value of the `Dnum` number.

| Name                  | Description                                    | Type        |
| --------------------- | ---------------------------------------------- | ----------- |
| `value`               | Value to remove the sign from                  | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to `value` decimals) | `number`    |
| returns               | Result value                                   | `Dnum`      |

#### Example

```ts
let value = [-100000n, 2];

dnum.abs(value); // [100000n, 2]
```

### `round(value, optionsOrDecimals)`

Equivalent to the [`Math.round()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round) function, with added option to forcibly round up or down: it returns the value of a number rounded to the nearest integer.

| Name                          | Description                                                                                                        | Type        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| `value`                       | Value to round to the nearest integer                                                                              | `Numberish` |
| `options.decimals` (optional) | Results decimals (defaults to `value` decimals). Setting `options` to a `number` acts as an alias for this option. | `Decimals`  |
| `options.rounding` (optional) | How to round round results (defaults to `"ROUND_HALF"`)                                                            | `Rounding`  |
| returns                       | Result                                                                                                             | `Dnum`      |

#### Example

```ts
let value = [-123456n, 2]; // 1234.56

dnum.round(value); // [123500n, 2] or 1235.00
```

### `floor(value, decimals)`

Equivalent to the [`Math.floor()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor) function: it rounds down and returns the largest integer less than or equal to the number.

| Name                  | Description                                    | Type        |
| --------------------- | ---------------------------------------------- | ----------- |
| `value`               | Value to round down                            | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to `value` decimals) | `number`    |
| returns               | Result value                                   | `Dnum`      |

### `ceil(value, decimals)`

Equivalent to the [`Math.ceil()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil) function: it rounds rounds up and returns the smaller integer greater than or equal to the number.

| Name                  | Description                                    | Type        |
| --------------------- | ---------------------------------------------- | ----------- |
| `value`               | Value to round up                              | `Numberish` |
| `decimals` (optional) | Result decimals (defaults to `value` decimals) | `number`    |
| returns               | Result value                                   | `Dnum`      |

### `greaterThan(value1, value2)`

Equivalent to [the `>` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than): it returns `true` if the first value is greater than the second value and `false` otherwise, regardless of their respective decimals.

| Name                  | Description                                   | Type        |
| --------------------- | --------------------------------------------- | ----------- |
| `value1`              | First value                                   | `Numberish` |
| `value2`              | Second value                                  | `Numberish` |
| returns               | Result value                                  | `Dnum`      |

Alias: `gt()`

#### Example

```ts
let value1 = [10000100n, 4];
let value2 = [100000n, 2];

dnum.greaterThan(value1, value2); // true
dnum.greaterThan(value1, value1); // false
dnum.greaterThan(value2, value1); // false
```

### `lessThan(value1, value2)`

Equivalent to [the `<` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than): it returns `true` if the first value is less than the second value and `false` otherwise, regardless of their respective decimals.

| Name                  | Description                                   | Type        |
| --------------------- | --------------------------------------------- | ----------- |
| `value1`              | First value                                   | `Numberish` |
| `value2`              | Second value                                  | `Numberish` |
| returns               | Result value                                  | `Dnum`      |

Alias: `lt()`

#### Example

```ts
let value1 = [100000n, 2];
let value2 = [10000100n, 4];

dnum.lessThan(value1, value2); // true
dnum.lessThan(value1, value1); // false
dnum.lessThan(value2, value1); // false
```

### `equal(value1, value2)`

Equivalent to [the `==` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality): it returns `true` if the first value is equal to the second value and `false` otherwise, regardless of their respective decimals.

| Name                  | Description                                   | Type        |
| --------------------- | --------------------------------------------- | ----------- |
| `value1`              | First value                                   | `Numberish` |
| `value2`              | Second value                                  | `Numberish` |
| returns               | Result value                                  | `Dnum`      |

Alias: `eq()`

#### Example

```ts
let value1 = [100000n, 2];
let value2 = [10000000n, 4];

dnum.equal(value1, value2); // true
```

### `compare(value1, value2)`

Returns `1` if `value1 > value2`, `-1` if `value1 < value2`, `0` if `value1 == value2`. It makes it easy to combine `Dnum` values with sorting functions such as [`Array#sort()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

| Name     | Description  | Type           |
| -------- | ------------ | -------------- |
| `value1` | First value  | `Numberish`    |
| `value2` | Second value | `Numberish`    |
| returns  | Result value | `1 \| -1 \| 0` |

Alias: `cmp()`

#### Example

```ts
let sorted = [
  1,
  8n,
  [700n, 2],
  3.1,
  2n,
  5,
].sort(compare);

console.log(sorted); // [1, 2n, 3.1, 5, [700n, 2], 8n];
```

### `toNumber(value, optionsOrDigits)`

Converts the `Dnum` data structure into a `number`. [This might result in a loss of precision](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_encoding) depending on how large the number is.

| Name                       | Description                                                                                                                                                                                               | Type                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `value`                    | The number to convert into a `number`                                                                                                                                                                     | `Dnum`                                       |
| `options.digits`           | Number of digits to keep after the decimal point. Setting `options` to a number acts as an alias for this option (see example below). Defaults to the number of decimals in the `Dnum` passed to `value`. | `number`                                     |
| `options.decimalsRounding` | Method used to round to `digits` decimals (defaults to `"ROUND_HALF"`).                                                                                                                                   | `"ROUND_HALF" \| "ROUND_UP" \| "ROUND_DOWN"` |
| returns                    | Result value                                                                                                                                                                                              | `number`                                     |

```ts
let value = [123456789000000000000000n, 18];

toNumber(value); // 123456.789
toNumber(value, { digits: 1 }); // 123456.8
toNumber(value, 1); // 123456.8 (alias for { digits: 1 })
```

### `toString(value, optionsOrDigits)`

Converts the `Dnum` data structure into a `string`, without any formatting. [This might result in a loss of precision](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_encoding) depending on how large the number is.

| Name                       | Description                                                                                                                                                                                               | Type                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `value`                    | The number to convert into a `string`                                                                                                                                                                     | `Dnum`                                       |
| `options.digits`           | Number of digits to keep after the decimal point. Setting `options` to a number acts as an alias for this option (see example below). Defaults to the number of decimals in the `Dnum` passed to `value`. | `string`                                     |
| `options.decimalsRounding` | Method used to round to `digits` decimals (defaults to `"ROUND_HALF"`).                                                                                                                                   | `"ROUND_HALF" \| "ROUND_UP" \| "ROUND_DOWN"` |
| returns                    | Result value                                                                                                                                                                                              | `string`                                     |

```ts
let value = [123456789000000000000000n, 18];

toString(value); // "123456.789"
toString(value, { digits: 1 }); // "123456.8"
toString(value, 1); // "123456.8" (alias for { digits: 1 })
```

Note that if you want to format the number for display purposes, you should probably use `format()` instead. If you need to convert the number into a JSON-compatible string without any precision loss, use `toJSON()` instead.

### `toJSON(value)`

Converts the `Dnum` data structure into a JSON-compatible string. This function is provided because `JSON.stringify()` doesn’t work with `BigInt` data types.

| Name    | Description                       | Type     |
| ------- | --------------------------------- | -------- |
| `value` | The number to convert into a JSON | `Dnum`   |
| returns | Result value                      | `string` |

```ts
let json = toJSON([123456789000000000000n, 18]);

// json == "[\"123456789000000000000\", 18]";
```

### `fromJSON(value)`

Converts the string resulting from `toJSON()` back into a `Dnum`.

| Name    | Description                                    | Type     |
| ------- | ---------------------------------------------- | -------- |
| `value` | The string value to convert back into a `Dnum` | `string` |
| returns | Result value                                   | `Dnum`   |

```ts
let dnum = fromJSON("[\"123456789000000000000\", 18]");

// dnum == [123456789000000000000n, 18]
```

### `setDecimals(value, decimals, options)`

Return a new `Dnum` with a different amount of decimals. The value will reflect this change so that the represented number stays the same.

| Name            | Description                                                                                 | Type       |
| --------------- | ------------------------------------------------------------------------------------------- | ---------- |
| `value`         | The number from which decimals will be changed                                              | `Dnum`     |
| `decimals`      | New number of decimals                                                                      | `number`   |
| `options.round` | In case of reduction, whether to round the remaining decimals (defaults to `"ROUND_HALF"`). | `Rounding` |
| returns         | Result value                                                                                | `Dnum`     |

Note: `from(value, decimals)` can also be used instead.

## Tree shaking

To make use of tree shaking, named exports are also provided:

```ts
import { format, from } from "dnum";
```

## FAQ

### Should dnum be used instead of BigInt or libraries such as BN.js or decimal.js?

dnum is not a full replacement for libraries such as [decimal.js](https://mikemcl.github.io/decimal.js/) or `BigInt`. Instead, dnum focuses on a small (~1kb) set of utilities focused around the simple `Dnum` data structure, allowing to manipulate numbers represented in various decimal precisions in a safe manner.

### Why is it called dnum?

dnum stands for Decimal Numbers.

### Who made the logo and banner? 😍

The gorgeous visual identity of dnum has been created by [Paty Davila](https://twitter.com/dizzypaty).

## Acknowledgements

- [ethers](https://ethers.org/), in particular its [`parseFixed()`](https://github.com/ethers-io/ethers.js/blob/8b62aeff9cce44cbd16ff41f8fc01ebb101f8265/packages/bignumber/src.ts/fixednumber.ts#L70) function.
- [token-amount](https://github.com/aragon/token-amount) which was an attempt at solving a similar problem.
