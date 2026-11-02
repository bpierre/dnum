import { describe, expect, it } from "bun:test";
import { format, from } from "../src";

describe("format() with localized digits and compact notation", () => {
  it.each(
    [
      ["ar-EG", "١٬٢٣٤٫٥٦", "٠٫٠٥", "١٢٫٠٠", "٠٫٠٠", "٠٫٠٠٠٠٠١٣"],
      ["fa-IR", "۱٬۲۳۴٫۵۶", "۰٫۰۵", "۱۲٫۰۰", "۰٫۰۰", "۰٫۰۰۰۰۰۱۳"],
      [
        "en-US-u-nu-fullwide",
        "１,２３４.５６",
        "０.０５",
        "１２.００",
        "０.００",
        "０.０００００１３",
      ],
      [
        "zh-CN-u-nu-hanidec",
        "一,二三四.五六",
        "〇.〇五",
        "一二.〇〇",
        "〇.〇〇",
        "〇.〇〇〇〇〇一三",
      ],
    ] as const,
  )(
    "preserves fractions and localizes digits for %s",
    (locale, positive, tiny, padded, zero, significant) => {
      expect(format([123456n, 2], { locale })).toBe(positive);
      expect(format([-123456n, 2], { locale })).toBe(`-${positive}`);
      expect(format([5n, 2], { locale })).toBe(tiny);
      expect(format([12n, 0], { locale, digits: 2, trailingZeros: true }))
        .toBe(padded);
      expect(format([0n, 2], { locale, trailingZeros: true })).toBe(zero);
      expect(format([126n, 8], { locale, significantDigits: 2 }))
        .toBe(significant);
    },
  );

  it.each(
    [
      ["ar-EG", "١٢٫٣٤"],
      ["fa-IR", "۱۲٫۳۴"],
      ["en-US-u-nu-fullwide", "１２.３４"],
      ["zh-CN-u-nu-hanidec", "一二.三四"],
    ] as const,
  )(
    "keeps fractions before compact notation applies for %s",
    (locale, expected) => {
      expect(format([1234n, 2], { locale, compact: true })).toBe(expected);
    },
  );

  it.each([
    "ar-EG",
    "fa-IR",
    "en-US-u-nu-fullwide",
    "zh-CN-u-nu-hanidec",
    "sw",
    "fr-FR",
    "en-US",
    "ar-EG-u-nu-latn",
    "ja-JP",
  ])(
    "omits the original fraction when compact notation applies for %s",
    (locale) => {
      const expected = new Intl.NumberFormat(locale, { notation: "compact" })
        .format(123456n);
      expect(format([12345678n, 2], { locale, compact: true })).toBe(expected);
    },
  );

  it.each(
    [
      ["en-US", 99999n, "999.99"],
      ["de-DE", 123456n, "1234,56"],
      ["de-DE", 1234567n, "12.345,67"],
      ["ja-JP", 123456n, "1234.56"],
    ] as const,
  )(
    "preserves fractions when compact notation does not scale %s/%s",
    (locale, value, expected) => {
      expect(format([value, 2], { locale, compact: true })).toBe(expected);
      expect(format([-value, 2], { locale, compact: true }))
        .toBe(`-${expected}`);
    },
  );

  it("preserves arbitrary precision while translating fractional digits", () => {
    expect(format(from("9007199254740993.000000000000000001"), {
      locale: "en-US-u-nu-fullwide",
    })).toBe("９,００７,１９９,２５４,７４０,９９３." + "０".repeat(17) + "１");
  });
});
