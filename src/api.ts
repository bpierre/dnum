// forces vite-plugin-dts to generate types.d.ts
import "./types";

import {
  from,
  fromJSON,
  isDnum,
  setDecimals,
  toJSON,
  toNumber,
  toParts,
} from "./dnum";
import { format } from "./formatting";
import { add, divide, multiply, subtract } from "./operations";

export type { Decimals, Dnum, Value } from "./types";

export {
  add,
  divide,
  divide as div,
  format,
  from,
  fromJSON,
  isDnum,
  multiply,
  multiply as mul,
  setDecimals,
  subtract,
  subtract as sub,
  toJSON,
  toNumber,
  toParts,
};
