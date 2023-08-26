import { Guild, PremiumType, UserData, Player, PlayerState, GameState } from "./types"

export const userData: UserData = {
  id: "1",
  username: "shiggy",
  avatar: "",
  premium_type: PremiumType.None,
}

// export const gameState: GameState = {
//   allPlayers: players; 
// }

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

export const userGuilds: Guild[] = [
  {
    id: "1",
    name: "string",
    icon: "",
    owner: true,
    permissions: 1,
    permissions_new: "string",
    features: [],
  },
  {
    id: "2",
    name: "epic lmao",
    icon: "",
    owner: true,
    permissions: 1,
    permissions_new: "string",
    features: [],
  },
  {
    id: "3",
    name: "epic",
    icon: "",
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