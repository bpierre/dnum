import type { Dnum } from "./types";

import { divideAndRound } from "./utils";

export function formatNumber(
  value: bigint | number | string,
  digits: number = 2,
  {
    trailingZeros = false,
    compact = false,
  }: {
    compact?: boolean;
    trailingZeros?: boolean;
  } = {},
): string {
  digits = Number(digits);
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: trailingZeros ? digits : 0,
      maximumFractionDigits: digits,
      notation: compact ? "compact" : "standard",
    }).format as (value: bigint | number | string) => string
  )(String(value));
}

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
  const [value, decimals] = dnum;

  // options.digits can also be passed directly as the third argument
  if (typeof optionsOrDigits === "number") {
    optionsOrDigits = { digits: optionsOrDigits };
  }

  const {
    compact = false,
    digits = decimals,
    trailingZeros = false,
  } = optionsOrDigits;

  if (decimals === 0) {
    return formatNumber(value, digits, { compact });
  }

  const decimalsDivisor = BigInt(10) ** BigInt(decimals);

  const whole = String(value / decimalsDivisor);
  let fraction = String(value % decimalsDivisor);

  const zeros = "0".repeat(
    Math.max(0, String(decimalsDivisor).length - fraction.length - 1),
  );

  fraction = zeros + divideAndRound(
    BigInt(fraction),
    BigInt(10) ** BigInt(decimals - digits),
  );

  if (!trailingZeros) {
    fraction = fraction.replace(/0+$/, "");
  }

  return formatNumber(
    fraction === "" || BigInt(fraction) === BigInt(0)
      ? whole
      : `${whole}.${fraction}`,
    digits,
    { compact, trailingZeros },
  );
}
