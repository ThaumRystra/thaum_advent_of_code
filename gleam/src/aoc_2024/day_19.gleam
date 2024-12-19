import gleam/dict
import gleam/int

// import gleam/io
import gleam/list
import gleam/set
import gleam/string
import glemo

pub fn pt_1(input: String) {
  // Setup
  let #(towels_input, designs) = parse_input(input)
  let towels = key_map(towels_input)
  let towel_lengths =
    dict.keys(towels)
    |> list.sort(int.compare)
  let assert Ok(max_towel_length) = list.last(towel_lengths)

  // Make a memoised way of getting valid towels
  glemo.init(["valid_towels"])
  let get_valid_towels = glemo.memo(
    _,
    "valid_towels",
    fn(substr) { get_valid_towels(substr, towel_lengths, towels) },
  )
  // Count the valid designs
  glemo.init(["validate_design"])
  designs
  |> list.fold(0, fn(count, design) {
    let valid =
      design
      |> glemo.memo("validate_design", fn(design) {
        validate_design(design, get_valid_towels, max_towel_length)
      })
    // io.debug(design)
    // io.debug(valid)
    case valid {
      True -> count + 1
      False -> count
    }
  })
}

pub fn pt_2(input: String) {
  // Setup
  let #(towels_input, designs) = parse_input(input)
  let towels = key_map(towels_input)
  let towel_lengths =
    dict.keys(towels)
    |> list.sort(int.compare)
  let assert Ok(max_towel_length) = list.last(towel_lengths)
  // Make a memoised way of getting valid towels
  glemo.init(["valid_towels"])
  let get_valid_towels = glemo.memo(
    _,
    "valid_towels",
    fn(substr) { get_valid_towels(substr, towel_lengths, towels) },
  )
  // Count all the valid combinations
  glemo.init(["count_valid_designs"])
  designs
  |> list.fold(0, fn(count, design) {
    design
    |> glemo.memo("count_valid_designs", fn(design) {
      count_valid_designs(design, get_valid_towels, max_towel_length)
    })
    |> int.add(count)
  })
}

fn validate_design(
  design: String,
  get_valid_towels: fn(String) -> List(String),
  max_towel_length: Int,
) -> Bool {
  case design {
    "" -> {
      True
    }
    _ -> {
      let sub_str = design |> string.slice(0, max_towel_length)
      get_valid_towels(sub_str)
      |> list.fold(False, fn(acc, towel) {
        let towel_length = string.length(towel)
        let design_length = string.length(design)
        let new_design = string.slice(design, towel_length, design_length)
        let valid =
          new_design
          |> glemo.memo("validate_design", fn(new_design: String) {
            validate_design(new_design, get_valid_towels, max_towel_length)
          })
        case valid {
          True -> True
          False -> acc
        }
      })
    }
  }
}

fn count_valid_designs(
  design: String,
  get_valid_towels: fn(String) -> List(String),
  max_towel_length: Int,
) -> Int {
  case design {
    "" -> {
      1
    }
    _ -> {
      let sub_str = design |> string.slice(0, max_towel_length)
      get_valid_towels(sub_str)
      |> list.fold(0, fn(acc, towel) {
        let towel_length = string.length(towel)
        let design_length = string.length(design)
        let new_design = string.slice(design, towel_length, design_length)
        new_design
        |> glemo.memo("count_valid_designs", fn(new_design: String) {
          count_valid_designs(new_design, get_valid_towels, max_towel_length)
        })
        |> int.add(acc)
      })
    }
  }
}

fn get_valid_towels(
  substr: String,
  towel_lengths: List(Int),
  towels: dict.Dict(Int, set.Set(String)),
) -> List(String) {
  towel_lengths
  |> list.fold([], fn(acc, length) {
    let towel_to_find = string.slice(substr, 0, length)
    let found = case dict.get(towels, length) {
      Ok(towel_set) -> set.contains(towel_set, towel_to_find)
      Error(Nil) -> False
    }
    case found {
      True -> [towel_to_find, ..acc]
      False -> acc
    }
  })
}

fn parse_input(input: String) -> #(List(String), List(String)) {
  let assert [left, right] = string.split(input, "\n\n")

  let towels =
    left
    |> string.split(", ")
    |> list.map(string.trim)

  let designs =
    right
    |> string.split("\n")
    |> list.map(string.trim)

  #(towels, designs)
}

fn key_map(towels_input: List(String)) -> dict.Dict(Int, set.Set(String)) {
  towels_input
  |> list.group(string.length)
  |> dict.map_values(fn(_key, group) -> set.Set(String) { set.from_list(group) })
}
