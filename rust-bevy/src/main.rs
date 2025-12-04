use bevy::{
    // color::palettes::basic::*,
    ecs::relationship::RelatedSpawnerCommands,
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
    commands.spawn(Camera2d);
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

            // Buttons per year
            for year in [2025] {
                parent
                    .spawn(Node {
                        flex_direction: FlexDirection::Column,
                        align_items: AlignItems::Center,
                        row_gap: Val::Px(10.),
                        ..default()
                    })
                    .with_children(|year_container| {
                        // year title
                        year_container.spawn((
                            Text::new(format!("{}", year)),
                            TextFont {
                                font_size: 32.,
                                ..default()
                            },
                        ));

                        // Days in a grid
                        year_container
                            .spawn(Node {
                                display: Display::Grid,
                                grid_template_columns: RepeatedGridTrack::flex(5, 1.),
                                column_gap: Val::Px(5.0),
                                row_gap: Val::Px(5.0),
                                ..default()
                            })
                            .with_children(|grid| {
                                for day in 1..=12 {
                                    day_button(grid, year, day);
                                }
                            });
                    });
            }
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

fn day_button(parent: &mut RelatedSpawnerCommands<'_, ChildOf>, year: u16, day: u16) {
    parent
        .spawn((
            Button,
            Puzzle {
                year: Year(year),
                day: Day(day),
            },
            Node {
                width: Val::Px(50.),
                height: Val::Px(50.),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                ..default()
            },
            BackgroundColor(Color::srgb(0.15, 0.15, 0.15)),
            BorderRadius::all(Val::Px(5.)),
        ))
        .with_children(|cell| {
            cell.spawn((
                Text::new(format!("{}", day)),
                TextFont {
                    font_size: 24.,
                    ..default()
                },
            ));
        });
}
