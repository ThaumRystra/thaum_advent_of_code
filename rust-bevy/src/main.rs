use bevy::{
    // color::palettes::basic::*,
    prelude::*,
};
mod year_2025;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct Year(u16);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct Day(u16);

#[derive(States, Debug, Clone, PartialEq, Eq, Hash, Default)]
enum AppState {
    #[default]
    Menu,
    Puzzle,
}

#[derive(Component)]
struct Puzzle {
    year: Year,
    day: Day,
}

struct YearOfPuzzles {
    year: Year,
    days: Vec<Day>,
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_state::<AppState>()
        .add_systems(Startup, setup_camera)
        .add_systems(OnEnter(AppState::Puzzle), load_puzzle)
        .add_systems(OnExit(AppState::Puzzle), unload_puzzle)
        .run();
}

#[derive(Component)]
struct MenuRoot;

fn setup_camera(mut commands: Commands) {
    commands
        .spawn((
            MenuRoot,
            Node {
                width: Val::Percent(100.),
                height: Val::Percent(100.),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                padding: UiRect::all(Val::Px(20.)),
                row_gap: Val::Px(10.),
                ..default()
            },
        ))
        .with_children(|parent| {
            // Title
            parent.spawn((
                Text::new("Advent of Code"),
                TextFont {
                    font_size: 48.,
                    ..default()
                },
            ));
        });
}

#[derive(Component)]
struct PuzzleRoot;

fn load_puzzle(mut commands: Commands) {
    commands.spawn(year_2025::day_1::build(PuzzleRoot));
}

fn unload_puzzle(mut commands: Commands, query: Query<Entity, With<PuzzleRoot>>) {
    for entity in query {
        commands.entity(entity).despawn();
    }
}
