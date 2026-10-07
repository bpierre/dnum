import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type * as Dnum from "../src";

export async function loadImplementations() {
  const load = (name: string): Promise<typeof Dnum> =>
    import(pathToFileURL(resolve(`benchmarks/.build/${name}.mjs`)).href);
  return { baseline: await load("baseline"), current: await load("current") };
}
