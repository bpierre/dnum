// forces vite-plugin-dts to generate types.d.ts
import "./types";

import {
  equalizeDecimals,
  from,
  fromJSON,
  isDnum,
  setDecimals,
  toJSON,
  toNumber,
  toParts,
} from "./dnum";
import { format } from "./formatting";
import {
  abs,
  add,
  divide,
  equal,
  greaterThan,
  lessThan,
  multiply,
  subtract,
} from "./operations";

export type { Decimals, Dnum, Value } from "./types";

export {
  abs,
  add,
  divide,
  divide as div,
  equal,
  equal as eq,
  equalizeDecimals,
  format,
  from,
  fromJSON,
  greaterThan,
  greaterThan as gt,
  isDnum,
  lessThan,
  lessThan as lt,
  multiply,
  multiply as mul,
  setDecimals,
  subtract,
  subtract as sub,
  toJSON,
  toNumber,
  toParts,
};
