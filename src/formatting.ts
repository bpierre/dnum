import type { Dnum } from "./types";

import { toParts } from "./dnum";

export function format(
  dnum: Dnum,
  optionsOrDigits:
    | {
      compact?: boolean;
      digits?: number; // defaults to decimals
      trailingZeros?: boolean;
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

  const wholeString = whole.toLocaleString("en-US", {
    notation: options.compact ? "compact" : "standard",
  });

  return fraction === null
      // check if the compact notation has been applied
      || !/\d/.test(wholeString.at(-1) ?? "")
    ? wholeString
    : `${wholeString}.${fraction}`;
}
