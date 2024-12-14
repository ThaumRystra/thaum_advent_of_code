import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";
// @deno-types="npm:@types/lodash"
import _ from "npm:lodash";

export const day14: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const robots = parseInput();
  return safetyFactor(robots, { x: 101, y: 103 }, 100);
}

function part2(): number {
  const robots = parseInput();
  const roomSize = { x: 101, y: 103 };
  const strings = new Set<string>();
  let step = 0;
  while (true) {
    const roomStr = roomString(roomSize, robots.map(
      robot => wrapLocation(predictLocation(robot, step), roomSize)
    ));
    if (strings.has(roomStr)) {
      console.log(step);
      console.log(roomStr);
      break;
    }
    strings.add(roomStr);
    if (step % 100 === 0) {
      console.log(step);
    }
    step++;
  }
  // write strings to file 
  // There are going to be 10k+ blocks, so we're searching them manually for a tree :')
  Deno.writeTextFileSync("day-14-output.txt", Array.from(strings).map((str, step) => 'step: ' + step + '\n' + str + '\n\n').join(''));
  return step;
}

type Robot = {
  startX: number;
  startY: number;
  velocityX: number;
  velocityY: number;
}

const _exampleInput = `
p=0,4 v=3,-3
p=6,3 v=-1,-3
p=10,3 v=-1,2
p=2,0 v=2,-1
p=0,0 v=1,3
p=3,0 v=-2,-2
p=7,6 v=-1,-3
p=3,0 v=-1,-2
p=9,3 v=2,3
p=7,3 v=-1,2
p=2,4 v=2,-3
p=9,5 v=-3,-3
`

const re = /^p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)$/;
function parseInput(): Robot[] {
  const input = readInput(2024, 14);
  // const input = _exampleInput.trim();
  return input.split('\n').map((line) => {
    const [_str, startX, startY, velocityX, velocityY] = re.exec(line.trim())?.map(Number) || [];
    return {
      startX, startY, velocityX, velocityY
    }
  });
}

function predictLocation(robot: Robot, time: number): { x: number, y: number } {
  const { startX, startY, velocityX, velocityY } = robot;
  const x = startX + velocityX * time;
  const y = startY + velocityY * time;
  return { x, y };
}

function wrapLocation(location: { x: number, y: number }, roomSize: { x: number, y: number }): { x: number, y: number } {
  let x = location.x % roomSize.x;
  let y = location.y % roomSize.y;
  if (x < 0) {
    x += roomSize.x;
  }
  if (y < 0) {
    y += roomSize.y;
  }
  return { x, y };
}

function safetyFactor(robots: Robot[], roomSize: { x: number, y: number }, time: number): number {
  const quadrants = [0, 0, 0, 0];
  const locations = robots.map(robot => wrapLocation(predictLocation(robot, time), roomSize))
  const roomCenter = { x: Math.floor(roomSize.x / 2), y: Math.floor(roomSize.y / 2) };
  locations.forEach(location => {
    if (location.x < roomCenter.x) {
      if (location.y < roomCenter.y) {
        quadrants[0]++;
      } else if (location.y > roomCenter.y) {
        quadrants[1]++;
      }
    } if (location.x > roomCenter.x) {
      if (location.y < roomCenter.y) {
        quadrants[2]++;
      } else if (location.y > roomCenter.y) {
        quadrants[3]++;
      }
    }
  });
  console.log(roomString(roomSize, locations));
  return quadrants.reduce((acc, cur) => acc * cur, 1);
}

function roomString(roomSize: { x: number, y: number }, locations: { x: number, y: number }[]) {
  const room = new Array(roomSize.y).fill(0).map(() => new Array(roomSize.x).fill(0));
  locations.forEach(location => {
    room[location.y][location.x] += 1;
  });
  return room.map(row => row.map(cell => cell ? cell : '.').join('')).join('\n');
}
