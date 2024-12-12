import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day12: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const farm = parseInput();
  floodFillRegions(farm);
  buildFences(farm);
  const regions = _.groupBy(farm.flat(), plot => plot.region)
  return Object.values(regions).reduce((acc, region) => acc + scoreRegion(region), 0);
}

function part2(): number {
  const farm = parseInput();
  floodFillRegions(farm);
  buildFences(farm);
  priceFences(farm);
  const regions = _.groupBy(farm.flat(), plot => plot.region)
  return Object.values(regions).reduce((acc, region) => acc + scoreBulkRegion(region), 0);
}

type Plot = {
  row: number;
  col: number;
  plant: string;
  region: number;
  fences: {
    n: boolean;
    s: boolean;
    e: boolean;
    w: boolean;
  }
}

type BulkFencePlot = Plot & {
  fencePrices: {
    n: number;
    s: number;
    e: number;
    w: number;
  }
}

type Coords = [number, number];

function parseInput(): Plot[][] {
  const input = readInput(2024, 12);
  // const input = _exampleInput.trim();
  return input.split('\n').map((line, row) => line.split('').map((char, col): Plot => {
    return {
      row,
      col,
      plant: char,
      region: 0,
      fences: { n: false, e: false, w: false, s: false }
    };
  }));
}

function floodFillRegions(farm: Plot[][]): void {
  let currentRegion = 1;
  for (const row of farm) {
    for (const plot of row) {
      if (plot.region === 0) {
        plot.region = currentRegion;
        flood(farm, plot);
        currentRegion++;
      }
    }
  }
}

function flood(farm: Plot[][], startPlot: Plot): void {
  getNeighbors(farm, startPlot).forEach(plot => {
    if (plot.region !== 0) return;
    if (plot.plant !== startPlot.plant) return;
    plot.region = startPlot.region;
    flood(farm, plot);
  });
}

function getNeighbors(farm: Plot[][], plot: Plot): Plot[] {
  const { row, col } = plot;
  return [
    farm[row - 1]?.[col],
    farm[row]?.[col - 1],
    farm[row]?.[col + 1],
    farm[row + 1]?.[col],
  ].filter(plot => plot !== undefined);
}

function buildFences(farm: Plot[][]) {
  // look at the plot to the left and right, and the plot above and below
  // If there is a change in region, mark the fence
  for (let col = 0; col <= farm[0].length; col++) {
    for (let row = 0; row <= farm.length; row++) {
      const leftPlot = farm[row]?.[col - 1];
      const rightPlot = farm[row]?.[col];
      if (leftPlot?.region !== rightPlot?.region) {
        if (leftPlot) leftPlot.fences.e = true;
        if (rightPlot) rightPlot.fences.w = true;
      }
      const topPlot = farm[row - 1]?.[col];
      const bottomPlot = farm[row]?.[col];
      if (topPlot?.region !== bottomPlot?.region) {
        if (topPlot) topPlot.fences.s = true;
        if (bottomPlot) bottomPlot.fences.n = true;
      }
    }
  }
}

function _printFarm(farm: Plot[][]) {
  console.log(farm.map(row => [
    row.map(plot => plot.fences.n ? '███' : '   ').join(''),
    row.map(plot => `${plot.fences.w ? '█' : ' '}${plot.plant}${plot.fences.e ? '█' : ' '}`).join(''),
    row.map(plot => plot.fences.s ? '███' : '   ').join(''),
  ].join('\n')
  ).join('\n'));
}

function _printBulkPriceFarm(farm: BulkFencePlot[][]) {
  console.log(farm.map(row => [
    row.map(plot => plot.fences.n ? plot.fencePrices.n ? '\u001b[31m █ \u001b[0m' : ' █ ' : '   ').join(''),
    row.map(plot => `${plot.fences.w ? plot.fencePrices.w ? '\u001b[31m█\u001b[0m' : '█' : ' '}${plot.plant}${plot.fences.e ? plot.fencePrices.e ? '\u001b[31m█\u001b[0m' : '█' : ' '}`).join(''),
    row.map(plot => plot.fences.s ? plot.fencePrices.s ? '\u001b[31m █ \u001b[0m' : ' █ ' : '   ').join(''),
  ].join('\n')
  ).join('\n'));
}

function scoreRegion(region: Plot[]): number {
  const area = region.length;
  const fences = region.reduce((acc, plot) => acc
    + +plot.fences.n
    + +plot.fences.s
    + +plot.fences.e
    + +plot.fences.w
    , 0);
  return area * fences;
}

function scoreBulkRegion(region: BulkFencePlot[]): number {
  const area = region.length;
  const fences = region.reduce((acc, plot) => acc
    + plot.fencePrices.n
    + plot.fencePrices.s
    + plot.fencePrices.e
    + plot.fencePrices.w
    , 0);
  return area * fences;
}

function priceFences(farm: Plot[][]): asserts farm is BulkFencePlot[][] {
  // walk left to right down every row, only add a price to the first n and s fence of a region
  for (let row = 0; row < farm.length; row++) {
    let currentRegion = 0;
    let billedNorthFence = false;
    let billedSouthFence = false;
    for (let col = 0; col < farm[0].length; col++) {
      const plot = farm[row][col] as BulkFencePlot;
      plot.fencePrices = { n: 0, s: 0, e: 0, w: 0 };
      if (plot.region !== currentRegion) {
        billedNorthFence = false;
        billedSouthFence = false;
        currentRegion = plot.region;
      }
      if (plot.fences.n) {
        if (!billedNorthFence) {
          plot.fencePrices.n = 1;
          billedNorthFence = true;
        }
      } else {
        billedNorthFence = false;
      }
      if (plot.fences.s) {
        if (!billedSouthFence) {
          plot.fencePrices.s = 1;
          billedSouthFence = true;
        }
      } else {
        billedSouthFence = false;
      }
    }
  }
  // walk top to bottom down every col, only add a price to the first e and w fence of a region
  for (let col = 0; col < farm[0].length; col++) {
    let currentRegion = 0;
    let billedEastFence = false;
    let billedWestFence = false;
    for (let row = 0; row < farm.length; row++) {
      const plot = farm[row][col] as BulkFencePlot;
      if (plot.region !== currentRegion) {
        billedEastFence = false;
        billedWestFence = false;
        currentRegion = plot.region;
      }
      if (plot.fences.e) {
        if (!billedEastFence) {
          plot.fencePrices.e = 1;
          billedEastFence = true;
        }
      } else {
        billedEastFence = false;
      }
      if (plot.fences.w) {
        if (!billedWestFence) {
          plot.fencePrices.w = 1;
          billedWestFence = true;
        }
      } else {
        billedWestFence = false;
      }
    }
  }
}
