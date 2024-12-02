import gleam/regexp

pub fn split_by_space(input: String) -> List(String) {
  let assert Ok(spaces) = regexp.from_string("\\s+")
  regexp.split(spaces, input)
}
