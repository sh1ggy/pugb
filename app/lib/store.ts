import { atom } from 'jotai'
import { Guild, UserData } from './types'

const userDataAtom = atom<null | UserData>(null);
const userGuildsAtom = atom<null | Guild[]>([])

export { userDataAtom, userGuildsAtom }