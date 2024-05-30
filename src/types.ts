export type Numberish = bigint | number | string | Dnum;
export type Value = bigint;
export type Decimals = number;
export type Rounding = "ROUND_HALF" | "ROUND_UP" | "ROUND_DOWN";
export type Dnum = readonly [value: Value, decimals: Decimals];
