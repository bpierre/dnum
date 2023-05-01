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
  ceil,
  compare,
  divide,
  equal,
  floor,
  greaterThan,
  lessThan,
  multiply,
  remainder,
  round,
  subtract,
} from "./operations";

export type { Decimals, Dnum, Value } from "./types";

export {
  abs,
  add,
  ceil,
  compare,
  compare as cmp,
  divide,
  divide as div,
  equal,
  equal as eq,
  equalizeDecimals,
  floor,
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
  remainder,
  remainder as rem,
  round,
  setDecimals,
  subtract,
  subtract as sub,
  toJSON,
  toNumber,
  toParts,
};
