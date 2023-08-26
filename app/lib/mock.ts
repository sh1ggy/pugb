import { Guild, PremiumType, UserData, Player, PlayerState, GameState, Game, Thread } from "./types"

export const userData: UserData = {
  id: "1",
  username: "shiggy",
  avatar: "http://placekitten.com/200/300",
  premium_type: PremiumType.None,
}

export const players: Player[] = [
  {
    id: "1",
    username: "cum",
    avatar: "http://placekitten.com/200/300",
    active: true,
    state: PlayerState.Alive,
    premium_type: PremiumType.None,
  },
  {
    id: "2",
    username: "cum",
    avatar: "http://placekitten.com/200/300",
    active: true,
    state: PlayerState.Alive,
    premium_type: PremiumType.None,
  },
  {
    id: "3",
    username: "cum",
    avatar: "http://placekitten.com/200/300",
    active: true,
    state: PlayerState.Alive,
    premium_type: PremiumType.None,
  },
  {
    id: "4",
    username: "cum",
    avatar: "http://placekitten.com/200/300",
    active: true,
    state: PlayerState.Alive,
    premium_type: PremiumType.None,
  },
  {
    id: "5",
    username: "cum",
    avatar: "http://placekitten.com/200/300",
    active: true,
    state: PlayerState.Alive,
    premium_type: PremiumType.None,
  },
]

export const gameState: GameState = {
  allPlayers: players,
  activePlayers: players,
  killFeed: [],
  status: false
}

export const game: Game = {
  thread: {
    name: "string",
    started_by: "string",
    id: "string",
    guildID: "string",
  },
  gameState: gameState,
  id: ""
}

export const userGuilds: Guild[] = [
  {
    id: "1",
    name: "string",
    icon: "http://placekitten.com/200/300",
    owner: true,
    permissions: 1,
    permissions_new: "string",
    features: [],
  },
  {
    id: "2",
    name: "epic lmao",
    icon: "http://placekitten.com/200/300",
    owner: true,
    permissions: 1,
    permissions_new: "string",
    features: [],
  },
  {
    id: "3",
    name: "epic",
    icon: "http://placekitten.com/200/300",
    owner: true,
    permissions: 1,
    permissions_new: "string",
    features: [],
  },
  // {
  //   id: "4",
  //   name: "cum",
  //   icon: "",
  //   owner: true,
  //   permissions: 1,
  //   permissions_new: "string",
  //   features: [],
  // },
  // {
  //   id: "5",
  //   name: "cum",
  //   icon: "",
  //   owner: true,
  //   permissions: 1,
  //   permissions_new: "string",
  //   features: [],
  // },
  // {
  //   id: "6",
  //   name: "cum",
  //   icon: "",
  //   owner: true,
  //   permissions: 1,
  //   permissions_new: "string",
  //   features: [],
  // },

]