import { useAtom } from "jotai";
import { ScrollView } from "react-native";
import { YStack, Avatar, Text, XStack } from "tamagui";
import { selectedGameAtom } from "../lib/store";

export function KillFeed() {
  const [selectedGame, setSelectedGame] = useAtom(selectedGameAtom)
  if (!selectedGame) return (
    <Text>Loading</Text>
  )
  return (
    <YStack w={300} h={400} bg={'#8b89ac'} p={'$3'}>
      <ScrollView>
        {
          selectedGame.state.players.map((player) => (
            <XStack>
              <Avatar circular size="$3">
                <Avatar.Image src={`https://cdn.discordapp.com/avatars/${player?.user.id}/${player?.user.avatar}.png`} />
                <Avatar.Fallback bc="#8b89ac" />
              </Avatar>
              <Text>{player.user.username}</Text>
              <Text>{player.state}</Text>
            </XStack>
          ))
        }
        < Text > {JSON.stringify(selectedGame.state.players)}</Text>
      </ScrollView>

      {/* {gameState.killFeed.map((kill) => {
      <XStack>
        <Text>{kill.time}</Text>
        <Text>{kill.killerId}</Text>
        <Text>{kill.killeeId}</Text>
      </XStack>
    })} */}
    </YStack >
  )
}