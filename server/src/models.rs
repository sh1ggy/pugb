use num_enum::{IntoPrimitive, TryFromPrimitive};
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use serenity::model::prelude::Guild;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserData {
  pub  id: String,
  pub  username: String,
  pub  email: String,
  pub  avatar: String,
  pub  premium_type: PremiumType,
  pub  rt: String,
}

#[derive(Debug, Serialize, Deserialize, Clone,  TryFromPrimitive, PartialEq, Eq)]
#[repr(i64)] // Specify the underlying integer representation
pub enum PremiumType {
    None,
    NitroClassic,
    Nitro,
    NitroBasic,
}

pub struct UserDataDTO {
    user: UserData,
    guilds: Vec<Guild>,
    // games: Vec<Game>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordTokenResponse {
  pub access_token: String,
  pub token_type: String,
  pub expires_in: i32,
  pub refresh_token: Option<String>,
  pub scope: String,
}
