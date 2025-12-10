import { year2023 } from "./2023/index.ts";
import { year2024 } from "./2024/index.ts";
import { year2025 } from "./2025/index.ts";
import { Year } from "./structure-types.ts";

if (!import.meta.main) {
  throw new Error("Run this script with `deno run` or `node`");
}

const years: { [year: string]: Year } = {
  "2023": year2023,
  "2024": year2024,
  "2025": year2025,
};

const [day, part = "1", year = "2024"] = Deno.args as [
  string,
  "1" | "2",
  string
];

if (!years[year]) {
  throw new Error(`No year ${year} found`);
}

if (!years[year][day]) {
  throw new Error(`No day ${day} found in year ${year}`);
}

if (!years[year][day][part]) {
  throw new Error(`No part ${part} found in day ${day} of year ${year}`);
}

console.time("Total runtime");
console.log(await years[year][day][part]());
console.timeEnd("Total runtime");
