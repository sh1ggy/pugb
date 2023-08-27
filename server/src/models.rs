use std::collections::HashMap;
use std::thread::Thread;

use num_enum::{IntoPrimitive, TryFromPrimitive};
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use serenity::model::id::UserId;
use serenity::model::prelude::MessageId;
use serenity::model::{
    prelude::{ChannelId, Guild, GuildChannel},
    user::User,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserData {
    pub id: String,
    pub username: String,
    pub email: String,
    pub avatar: String,
    pub premium_type: PremiumType,
    pub rt: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, TryFromPrimitive, PartialEq, Eq)]
#[repr(i64)] // Specify the underlying integer representation
pub enum PremiumType {
    None,
    NitroClassic,
    Nitro,
    NitroBasic,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserDataDTO {
    pub user: UserData,
    pub guilds: Vec<GuildDTO>,
    pub games: Vec<GameDTO>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GameDTO {

    pub thread: ThreadDTO,
    pub state: GameStateDTO,

}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThreadDTO {
    pub id: String,
    pub name: String,
    pub guildID: String,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GameStateDTO {
    pub thread: ChannelId,
    pub players: Vec< Player>,
    pub killfeed: Vec<Kill>,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GuildDTO {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i32,
    pub refresh_token: Option<String>,
    pub scope: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Game {
    pub first_message: MessageId,
    pub thread: GuildChannel,
    pub players: HashMap<UserId, Player>,
    pub killfeed: Vec<Kill>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]

pub struct Kill {
    pub id: String,
    pub time: u128,
    pub killmessageId: MessageId,
    pub killerId: String,
    pub killeeId: String,
    pub image: String,
    pub state: KillState,
}
#[derive(Debug, Serialize, Deserialize, Clone)]

pub enum KillState {
    Contested,
    Normal,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Player {
    pub user: User,
    pub state: PlayerState,
    pub active: PlayerActive,
}

// TODO: use bitflags instead here
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PlayerState {
    Alive,
    Dead,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PlayerActive {
    NotActive,
    Active,
}
