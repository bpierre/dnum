import type { Dnum } from "./types";

import { toParts } from "./dnum";

type SignDisplay = "auto" | "always" | "exceptZero" | "negative" | "never";

export function format(
  dnum: Dnum,
  // see toParts() in src/dnum.ts
  optionsOrDigits: Parameters<typeof toParts>[1] & {
    compact?: boolean;
    locale?: ConstructorParameters<typeof Intl.NumberFormat>[0];
    signDisplay?: SignDisplay;
  } = {},
): string {
  const options = typeof optionsOrDigits === "number"
    ? { digits: optionsOrDigits }
    : optionsOrDigits;

  const {
    compact,
    locale = Intl.NumberFormat().resolvedOptions().locale,
    signDisplay = "auto",
    ...toPartsOptions
  } = options;

  const [whole, fraction] = toParts(dnum, toPartsOptions);

  const decimalsSeparator = new Intl.NumberFormat(locale)
    .formatToParts(.1)
    .find((v) => v.type === "decimal")?.value ?? ".";

  const roundsToZero = whole === 0n && (
    fraction === null || /^0+$/.test(fraction)
  );

  const wholeString = formatSign(
    dnum,
    roundsToZero,
    signDisplay,
  ) + BigInt(whole).toLocaleString(locale, {
    notation: compact ? "compact" : "standard",
  });

  return fraction === null
      // check if a compact notation has been applied
      || !/\d/.test(wholeString.at(-1) as string) // “as string” is safe because whole.toLocaleString() always returns a non-empty string
    ? wholeString
    : `${wholeString}${decimalsSeparator}${fraction}`;
}

export function formatSign(
  dnum: Dnum,
  roundsToZero: boolean,
  signDisplay: SignDisplay,
): "-" | "+" | "" {
  if (signDisplay === "auto") {
    return dnum[0] >= 0n ? "" : "-";
  }
  if (signDisplay === "always") {
    return dnum[0] >= 0n ? "+" : "-";
  }
  if (signDisplay === "exceptZero") {
    return roundsToZero ? "" : (dnum[0] >= 0n ? "+" : "-");
  }
  if (signDisplay === "negative") {
    return dnum[0] >= 0n || roundsToZero ? "" : "-";
  }
  return "";
}
