export type { Decimals, Dnum, Value } from "./types";

import { from, fromJSON, isDnum, setDecimals, toJSON } from "./dnum";
import { format, formatNumber } from "./formatting";
import { add, divide, multiply, subtract } from "./operations";

const div = divide;
const mul = multiply;
const sub = subtract;

export default {
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
  toJSON,
};
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
  toJSON,
};
