import type { Dnum, Rounding } from "./types";

import { toParts } from "./dnum";
import { abs, divideAndRound, powerOfTen } from "./utils";

type SignDisplay = "auto" | "always" | "exceptZero" | "negative" | "never";

type Locale = ConstructorParameters<typeof Intl.NumberFormat>[0];
type Formatters = {
  factory: typeof Intl.NumberFormat;
  formatToParts: Intl.NumberFormat["formatToParts"];
  standard: Intl.NumberFormat;
  compact?: Intl.NumberFormat;
  decimal: string;
  numerals?: string[];
};
const formatterCache = new Map<string, Formatters>();

function getFormatters(locale: Locale): Formatters {
  // Locale arrays can be mutated by callers; only cache string keys.
  const cached = typeof locale === "string"
    ? formatterCache.get(locale)
    : undefined;
  if (
    cached && cached.factory === Intl.NumberFormat
    && cached.formatToParts === cached.standard.formatToParts
  ) return cached;
  const standard = new Intl.NumberFormat(locale);
  const formatters: Formatters = {
    factory: Intl.NumberFormat,
    // Retain the method for identity checks; calls still use its receiver.
    // oxlint-disable-next-line typescript-eslint/unbound-method
    formatToParts: standard.formatToParts,
    standard,
    decimal:
      standard.formatToParts(.1).find((part) => part.type === "decimal")?.value
        ?? ".",
    numerals: standard.format(0) === "0"
      ? undefined
      : Array.from({ length: 10 }, (_, digit) => standard.format(digit)),
  };
  if (typeof locale === "string") {
    formatterCache.delete(locale);
    if (formatterCache.size === 32) {
      formatterCache.delete(formatterCache.keys().next().value!);
    }
    formatterCache.set(locale, formatters);
  }
  return formatters;
}

export function format(
  dnum: Dnum,
  // see toParts() in src/dnum.ts
  optionsOrDigits: Parameters<typeof toParts>[1] & {
    compact?: boolean;
    locale?: ConstructorParameters<typeof Intl.NumberFormat>[0];
    signDisplay?: SignDisplay;
    significantDigits?: number;
  } = {},
): string {
  const options = typeof optionsOrDigits === "number"
    ? { digits: optionsOrDigits }
    : optionsOrDigits;

  const {
    compact,
    locale = Intl.NumberFormat().resolvedOptions().locale,
    signDisplay = "auto",
    significantDigits,
    ...toPartsOptions
  } = options;

  if (significantDigits !== undefined) {
    if (!Number.isSafeInteger(significantDigits) || significantDigits < 1) {
      throw new RangeError(
        "dnum: significantDigits must be a positive safe integer",
      );
    }
    if (compact) {
      throw new Error(
        "dnum: significantDigits cannot be combined with compact",
      );
    }
  }

  const [whole, fraction] = significantDigits === undefined
    ? toParts(dnum, toPartsOptions)
    : toSignificantParts(dnum, significantDigits, toPartsOptions);

  const formatters = getFormatters(locale);
  const wholeFormatter = compact
    ? (formatters.compact ??= new Intl.NumberFormat(locale, {
      notation: "compact",
    }))
    : formatters.standard;

  const roundsToZero = whole === 0n && (
    fraction === null || /^0+$/.test(fraction)
  );

  const compactParts = compact && fraction !== null
    ? wholeFormatter.formatToParts(whole)
    : undefined;
  const wholeString = formatSign(
    dnum,
    roundsToZero,
    signDisplay,
  ) + (
    compactParts?.map((part) => part.value).join("")
      ?? wholeFormatter.format(whole)
  );

  if (
    fraction === null
    || compactParts?.some((part) => part.type === "compact")
  ) return wholeString;

  const numerals = formatters.numerals;
  const localizedFraction = numerals
    ? fraction.replace(/\d/g, (digit) => numerals[Number(digit)]!)
    : fraction;
  return `${wholeString}${formatters.decimal}${localizedFraction}`;
}

function toSignificantParts(
  dnum: Dnum,
  significantDigits: number,
  options: {
    digits?: number;
    trailingZeros?: boolean;
    decimalsRounding?: Rounding;
  },
): ReturnType<typeof toParts> {
  const decimals = dnum[1];
  let value = abs(dnum[0]);

  if (value === 0n) {
    return toParts(dnum, {
      ...options,
      digits: options.digits ?? significantDigits - 1,
    });
  }

  // Negative digits round the integer part (e.g. 1234 to 1200).
  const getDigits = (value: bigint) =>
    Math.max(
      options.digits ?? -Infinity,
      significantDigits - value.toString().length + decimals,
    );
  const digits = getDigits(value);

  if (digits < decimals) {
    const divisor = powerOfTen(decimals - digits);
    value = divideAndRound(value, divisor, options.decimalsRounding) * divisor;
  }

  // A carry can change the magnitude, and therefore the required padding.
  return toParts([value, decimals], {
    digits: Math.max(0, getDigits(value)),
    trailingZeros: options.trailingZeros,
  });
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
