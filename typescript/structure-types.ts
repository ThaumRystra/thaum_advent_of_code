export type Part = () => number | string;

export type Day = {
  '1': Part;
  '2': Part;
}

export type Year = {
  [day: string]: Day;
}
