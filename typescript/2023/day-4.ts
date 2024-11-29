import readInput from "../read-input.ts";
import { Day } from "../structure-types.ts";

export const day4: Day = {
  '1': part1,
  '2': part2,
}

function part1(): number {
  const input = readInput(2023, 4);
  const cards = parseInput(input);
  return cards.reduce((total, card) => total + scoreCardPart1(card), 0);
}

function part2(): number {
  const input = readInput(2023, 4);
  const cards: CardPart2[] = parseInput(input).map((card) => {
    return {
      ...card,
      copies: 1,
    }
  });
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    for (let j = i + 1; j < i + 1 + card.overlap; j++) {
      const card2 = cards[j];
      if (!card2) continue;
      card2.copies += card.copies;
    }
  }
  return cards.reduce((total, card) => total + card.copies, 0);
}

type CardPart2 = {
  left: Set<number>;
  right: Set<number>;
  overlap: number;
  copies: number;
}

type Card = {
  left: Set<number>;
  right: Set<number>;
  overlap: number;
}

const scoreCardPart1 = (card: Card): number => {
  const overlap = card.overlap;
  if (overlap === 0) return 0;
  if (overlap === 1) return 1;
  const score = Math.pow(2, overlap - 1);
  return score;
}

const parseInput = (input: string) => input
  .trim()
  .split('\n')
  .map((card) => card.split(':')[1])
  .map((card) => {
    const [leftText, rightText] = card.split('|');
    const left = new Set(leftText.trim().split(/\s+/).map((number) => parseInt(number)));
    const right = new Set(rightText.trim().split(/\s+/).map((number) => parseInt(number)));
    const overlap = left.intersection(right).size;
    return { left, right, overlap }
  });
