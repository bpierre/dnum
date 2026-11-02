import { expect, it } from "bun:test";
import { format } from "../src";

function countIntlCalls(
  check: (calls: { standard: number; compact: number }) => void,
) {
  const original = Intl.NumberFormat;
  const calls = { standard: 0, compact: 0 };
  Intl.NumberFormat = new Proxy(original, {
    construct(target, args) {
      const formatter: Intl.NumberFormat = Reflect.construct(target, args);
      const kind = args[1]?.notation === "compact" ? "compact" : "standard";
      const countedFormat = (value: number | bigint) => {
        calls[kind]++;
        return formatter.format(value);
      };
      const countedParts = (value: number | bigint) => {
        calls[kind]++;
        return formatter.formatToParts(value);
      };
      return new Proxy(formatter, {
        get(target, key) {
          if (key === "format") return countedFormat;
          if (key === "formatToParts") return countedParts;
          return Reflect.get(target, key, target);
        },
      });
    },
  });
  try {
    check(calls);
  } finally {
    Intl.NumberFormat = original;
  }
}

it("does not build digit maps for integer-only locale lists", () => {
  countIntlCalls((calls) => {
    const locale = ["ar-EG", "en-US"];
    for (let i = 0; i < 3; i++) {
      expect(format([1234n, 0], { locale })).toBe("١٬٢٣٤");
    }
    // At most one metadata query and one rendering per uncached formatter.
    expect(calls.standard).toBeLessThanOrEqual(6);
  });
});

it("renders each compact value once across changing magnitudes", () => {
  countIntlCalls((calls) => {
    const values = [
      1234567n,
      12345678n,
      1234567n,
      12345678n,
      1234567n,
      12345678n,
    ];
    expect(
      values.map((value) =>
        format([value, 2], { locale: "ja-JP", compact: true })
      ),
    )
      .toEqual(["1.2万", "12万", "1.2万", "12万", "1.2万", "12万"]);
    expect(calls.compact).toBeLessThanOrEqual(values.length);
  });
});

it("reuses formatters, creates compact formatters lazily, and evicts old locales", () => {
  const original = Intl.NumberFormat;
  let allocations = 0;
  Intl.NumberFormat = new Proxy(original, {
    construct(target, args) {
      allocations++;
      return Reflect.construct(target, args);
    },
  });
  try {
    for (let i = 0; i < 33; i++) {
      expect(format([123456n, 2], { locale: `en-US-x-${i}` })).toBe("1,234.56");
    }
    expect(allocations).toBe(33);

    expect(format([123456n, 2], { locale: "en-US-x-32" })).toBe("1,234.56");
    expect(allocations).toBe(33);

    expect(format([123456n, 2], { locale: "en-US-x-32", compact: true })).toBe(
      "1.2K",
    );
    expect(allocations).toBe(34);
    expect(format([123456n, 2], { locale: "en-US-x-32", compact: true })).toBe(
      "1.2K",
    );
    expect(allocations).toBe(34);

    expect(format([123456n, 2], { locale: "en-US-x-0" })).toBe("1,234.56");
    expect(allocations).toBe(35);
    expect(format([123456n, 2], { locale: "en-US-x-0" })).toBe("1,234.56");
    expect(allocations).toBe(35);
  } finally {
    Intl.NumberFormat = original;
  }
});
