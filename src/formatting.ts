import type { Dnum } from "./types";

import { toParts } from "./dnum";

export function format(
  dnum: Dnum,
  optionsOrDigits:
    | {
      compact?: boolean;
      digits?: number; // defaults to decimals
      trailingZeros?: boolean;
      locale?: string;
    }
    | number = {},
): string {
  const options = typeof optionsOrDigits === "number"
    ? { digits: optionsOrDigits }
    : optionsOrDigits;

  const [whole, fraction] = toParts(dnum, {
    digits: options.digits,
    trailingZeros: options.trailingZeros,
  });

  const locale = options.locale ?? Intl.NumberFormat().resolvedOptions().locale;
  const decimalsSeparator =
    (new Intl.NumberFormat(locale)).formatToParts(.1).find(v =>
      v.type === "decimal"
    )?.value ?? ".";

  const wholeString = whole.toLocaleString(locale, {
    notation: options.compact ? "compact" : "standard",
  });

  return fraction === null
      // check if the compact notation has been applied
      || !/\d/.test(wholeString.at(-1) as string) // “as string” is safe because whole.toLocaleString() always returns a non-empty string
    ? wholeString
    : `${wholeString}${decimalsSeparator}${fraction}`;
}
