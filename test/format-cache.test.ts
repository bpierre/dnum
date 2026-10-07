import { expect, it } from "bun:test";
import { format } from "../src";

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
