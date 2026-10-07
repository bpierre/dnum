import type { Dnum } from "../src/types";

export type Dataset = {
  name: string;
  pairs: readonly (readonly [Dnum, Dnum])[];
};

// Fixed, varied operands: no RNG or construction in timed arithmetic loops.
export const datasets: Dataset[] = [
  { name: "money/2dp", pairs: makePairs(8, 2, 2) },
  { name: "tokens/18dp", pairs: makePairs(30, 18, 18) },
  { name: "tokens/6-18dp", pairs: makePairs(30, 18, 6) },
  { name: "large/72dp", pairs: makePairs(100, 72, 54) },
  { name: "huge/512digits", pairs: makePairs(512, 72, 72) },
];

function makePairs(
  digits: number,
  leftDecimals: number,
  rightDecimals: number,
) {
  return Array.from({ length: 16 }, (_, i): readonly [Dnum, Dnum] => {
    const value = (offset: number) =>
      BigInt(
        Array.from(
          { length: digits },
          (_, j) => String(1 + ((j * 7 + i + offset) % 9)),
        ).join(""),
      );
    return [
      [value(0) * (i % 3 === 0 ? -1n : 1n), leftDecimals],
      [value(3) * (i % 5 === 0 ? -1n : 1n), rightDecimals],
    ];
  });
}
