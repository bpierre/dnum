// forces vite-plugin-dts to generate types.d.ts
import "./types";

import { from, fromJSON, isDnum, setDecimals, toJSON } from "./dnum";
import { format, formatNumber } from "./formatting";
import { add, div, divide, mul, multiply, sub, subtract } from "./operations";

export type { Decimals, Dnum, Value } from "./types";

export {
  add,
  div,
  divide,
  format,
  formatNumber,
  from,
  fromJSON,
  isDnum,
  mul,
  multiply,
  setDecimals,
  sub,
  subtract,
  toJSON,
};
