use bevy::prelude::*;

#[derive(Component)]
pub struct Year2024Day1;

pub fn build(root: impl Component) -> impl Bundle {
    return (root, Year2024Day1);
}
