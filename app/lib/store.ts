import { atom } from 'jotai'
import { Game, Guild, UserData } from './types'

const userDataAtom = atom<null | UserData>(null);
const userGuildsAtom = atom<null | Guild[]>([])
const userGamesAtom = atom<null | Game[]>([]);

export { userDataAtom, userGuildsAtom, userGamesAtom }
const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=1144562548084060241&permissions=534723950656&scope=bot`