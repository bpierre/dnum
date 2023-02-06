import type { Dnum } from "./types";

import { toParts } from "./dnum";

export function format(
  dnum: Dnum,
  // see toParts() in src/dnum.ts
  optionsOrDigits: Parameters<typeof toParts>[1] & {
    compact?: boolean;
    locale?: ConstructorParameters<typeof Intl.NumberFormat>[0];
  },
): string {
  const options = typeof optionsOrDigits === "number"
    ? { digits: optionsOrDigits }
    : optionsOrDigits;

  const {
    compact,
    locale = Intl.NumberFormat().resolvedOptions().locale,
    ...toPartsOptions
  } = options;

  const [whole, fraction] = toParts(dnum, toPartsOptions);

  const decimalsSeparator = (
    new Intl.NumberFormat(locale)
      .formatToParts(.1)
      .find(v => v.type === "decimal")?.value ?? "."
  );

  const wholeString = whole.toLocaleString(locale, {
    notation: compact ? "compact" : "standard",
  });

  return fraction === null
      // check if the compact notation has been applied
      || !/\d/.test(wholeString.at(-1) as string) // “as string” is safe because whole.toLocaleString() always returns a non-empty string
    ? wholeString
    : `${wholeString}${decimalsSeparator}${fraction}`;
}
