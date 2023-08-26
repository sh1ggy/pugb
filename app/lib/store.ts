import { atom } from 'jotai'
import { Guild, Player, UserData } from './types'

const userDataAtom = atom<null | UserData>(null);
const userGuildsAtom = atom<null | Guild[]>([]);

// const memodPlayers = atom((get)=> {
//     const playerMap = new Map<string, Player>();
//     const playerList: Player[];
//     for (let i = 0; i < array.length; i++) {
//         const element = array[i];
        
//     }
// });

export { userDataAtom, userGuildsAtom }