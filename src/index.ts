export type { Decimals, Dnum, Value } from "./types";

import { from, fromJSON, isDnum, setDecimals, toJSON } from "./dnum";
import { format, formatNumber } from "./formatting";
import { divide, multiply } from "./operations";

export default {
  divide,
  format,
  formatNumber,
  from,
  fromJSON,
  isDnum,
  multiply,
  setDecimals,
  toJSON,
};
export {
  divide,
  format,
  formatNumber,
  from,
  fromJSON,
  isDnum,
  multiply,
  setDecimals,
  toJSON,
};
