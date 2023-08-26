import { atom } from 'jotai'
import { Game, Guild, UserData } from './types'

const userDataAtom = atom<null | UserData>(null);
const userGuildsAtom = atom<null | Guild[]>([])
const userGamesAtom = atom<null | Game[]>([]);

export { userDataAtom, userGuildsAtom, userGamesAtom }