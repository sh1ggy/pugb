import { atom } from 'jotai'
import { Game, Guild, Player, UserData } from './types'

const userDataAtom = atom<null | UserData>(null);
const userGuildsAtom = atom<null | Guild[]>([])
const userGamesAtom = atom<null | Game[]>([]);
const selectedGameAtom = atom<null | Game>(null);
// const userImgAtom = atom((get) => {
  //   const userData = get(userDataAtom);
  //   if (!userData) return placeholder;
  //   // TODO: account for Nitro user with png image
  //   else if (userData.premium_type == PremiumType.None) return `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
  //   else return `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.gif`;
  // })
const activePlayers = atom<string[]>([]);

export { userDataAtom, userGuildsAtom, userGamesAtom, selectedGameAtom}
const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=1144562548084060241&permissions=534723950656&scope=bot`