export interface CodeRequestDTO {
  code: String,
  code_verifier: String,
  redirect_uri: String,
}


// user: CurrentUser { id: UserId(1144562548084060241), avatar: Some("061ba7209bcff9e92d69140204e36081"), bot: true, discriminator: 1448, email: None, mfa_enabled: true, name: "pugb", verified: Some(true), public_flags: None, banner: None, accent_colour: None }, version: 10 } })))}
export interface UserData {
  id: string
  username: string
  avatar: string
  premium_type: PremiumType
  rt: string
}
export interface UserDataDTO extends UserData {
  guilds: Guild[],
}

export interface Guild {
  id: string
  name: string
  icon: string
  owner: boolean
  permissions: number
  permissions_new: string
  features: string[]
}

export enum PremiumType {
  None,
  NitroClassic,
  Nitro,
  NitroBasic,
}

export interface Game {
  id: string,
  guildID: string,
  thread: any,
  gameState: GameState,
}


export enum PlayerState {
  Alive,
  Dead,
}

export interface Player {
  id: string,
  username: string,
  avatar: string,
  active: boolean,
  state: PlayerState,
  premium_type: PremiumType,
}

export interface GameState {
  allPlayers: Player[],
  activePlayers: string[],
  killFeed: Kill[],
  status: boolean,
  // alivePlayers: string[],
  // deadPlayers: string[],
}

export enum KillState {
  Contested,
  Normal,
}

export interface Kill {
  id: string,
  killerId: string,
  killeeId: string,
  time: string,
  image: string, // CDN link
  state: KillState,
}

export interface Revive {
  id: string,
  playerId: string,
  killId: string,
  image: string // CDN link

}