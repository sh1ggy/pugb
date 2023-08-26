use std::collections::HashMap;

use num_enum::{IntoPrimitive, TryFromPrimitive};
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use serenity::model::id::UserId;
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
    user: UserData,
    guilds: Vec<GuildDTO>,
    // games: Vec<Game>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GuildDTO {
  id: String,
  name: String,
  icon: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i32,
    pub refresh_token: Option<String>,
    pub scope: String,
}

pub struct Game {
    thread: GuildChannel,
    players: HashMap<UserId, Player>,
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
  Alive, Dead, 
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PlayerActive {
  NotActive,
  Active
}
