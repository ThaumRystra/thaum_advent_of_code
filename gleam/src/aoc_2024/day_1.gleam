import gleam/int
import gleam/list
import gleam/string
import utils/regex

pub fn pt_1(input: String) {
  let #(left, right) = import_lists(input)

  // sort the lists
  let left = list.sort(left, int.compare)
  let right = list.sort(right, int.compare)

  // zip them together
  list.zip(left, right)
  // sum the differences
  |> list.fold(0, fn(total, pair) {
    let #(left, right) = pair
    total + int.absolute_value(left - right)
  })
}

pub fn pt_2(_input: String) {
  0
}

fn import_lists(input: String) -> #(List(Int), List(Int)) {
  string.trim(input)
  |> string.split("\n")
  |> list.map(regex.split_by_space)
  |> list.map(fn(list) {
    case list {
      [left, right] -> {
        let assert Ok(left_int) = int.parse(left)
        let assert Ok(right_int) = int.parse(right)
        #(left_int, right_int)
      }
      _ -> panic
    }
  })
  |> list.unzip
}
