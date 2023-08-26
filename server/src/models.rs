use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserData {
    id: u64,
    username: String,
    email: String,
    avatar: String,
    premium_type: PremiumType,
    rt: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PremiumType {
  None,
  NitroClassic,
  Nitro,
  NitroBasic,
}
