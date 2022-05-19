import { format, formatNumber } from "./formatting";
import { divide, multiply } from "./operations";
import { from, setDecimals } from "./dnum";

export type { Decimals, Dnum, Value } from "./types";

export default {
  divide,
  format,
  formatNumber,
  from,
  multiply,
  setDecimals,
};
export { format, formatNumber } from "./formatting";
export { divide, multiply } from "./operations";
export { from, setDecimals } from "./dnum";
