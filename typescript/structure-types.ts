export type Part = () =>
  | number
  | string
  | bigint
  | Promise<number | string | bigint>;

export type Day = {
  "1": Part;
  "2": Part;
};

export type Year = {
  [day: string]: Day;
};
