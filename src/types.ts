export type Decimals = number;
export type Dnum = readonly [value: Value, decimals: Decimals];
export type Numberish = bigint | number | string | Dnum;
export type Rounding = "ROUND_HALF" | "ROUND_UP" | "ROUND_DOWN";
export type Value = bigint;

export type AliasedOptions<
  Options extends Record<string, unknown>,
  AliasName extends keyof Options,
> =
  | Options
  | Options[AliasName];
