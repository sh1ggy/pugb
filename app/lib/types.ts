export interface CodeRequestDTO {
  code: String,
  code_verifier: String,
  redirect_uri: String,
}

export interface UserData {
  id: string
  username: string
  avatar: string
  premium_type: PremiumType
}
export interface UserDataDTO  {
  user: UserData
  guilds: Guild[],
  games: Game[],
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

export interface JSONError {
  error: {
    req_uuid: string, 
    type: string,
  }
}

export interface Game {
  thread: Thread,
  state: GameState,
}

export interface Thread {
  name: string,
  // started_by: string,
  id: string,
  guildID: string,
}


export enum PlayerState {
  Alive = "Alive",
  Dead = "Dead",
}

export interface Player {
  id: string,
  username: string,
  avatar: string,
  active: boolean,
  state: PlayerState,
  // premium_type: PremiumType,
}

export interface GameState {
  players: Player[],
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
  id: number,
  killerId: string,
  killeeId: string,
  killmessageId : string,
  time: number,
  image: string, // CDN link
  state: KillState,
}

export interface Revive {
  id: string,
  playerId: string,
  killId: string,
  image: string // CDN link

}