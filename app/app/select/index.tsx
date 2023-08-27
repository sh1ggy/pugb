import { Link, router } from "expo-router";
import { Button, Stack, Text, XStack, YStack, Checkbox, ScrollView, Paragraph, Square, Avatar } from "tamagui";
import { selectedGameAtom, userDataAtom, userGamesAtom, userGuildsAtom } from "../../lib/store";
import { useAtom } from "jotai";
// import { userGuilds } from "../../lib/mock";
import React, { useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Accordion } from 'tamagui';
import { ChevronDown } from "@tamagui/lucide-icons";
import { JSONError, UserDataDTO } from "../../lib/types";

export default function Select() {
  const [isLoading, setIsLoading] = useState(false);
  const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const [userGames, setUserGames] = useAtom(userGamesAtom);
  const [userData, setUserData] = useAtom(userDataAtom);
  const [selectedGame, setSelectedGame] = useAtom(selectedGameAtom);

  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

  const guildRequestFn = async () => {
    let res;
    try {
      // TODO validation
      const URL = `${SERVER_URL}/api/get_user`
      setIsLoading(true);
      res = await fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const jsonres: any = await res.json();
      if (jsonres.error) {
        const errjson: JSONError = jsonres;
        if (errjson.error.type == "AuthFailTokenExpired") {
          console.log(JSON.stringify(errjson, null, 2))
          setIsLoading(false);
          router.push("/")
          return;
        }
      }
      const succjson: UserDataDTO = jsonres;
      setIsLoading(false);
      setUserGuilds(succjson.guilds);
      const { guilds, games, user } = succjson;
      setUserData(user);
      setUserGames(games);
      console.log({ succjson });

      setUserGuilds(succjson.guilds);
    }
    catch (e) {
      console.log(JSON.stringify(e, null, 2));
    }
  }

  const activeGuilds = useMemo(() => {
    if (!userGuilds || !userGames) return [];
    return userGuilds.map((guild) => {
      const guildGames = userGames.filter((game) => {
        return game.thread.guildID == guild.id
      });
      return { ...guild, games: guildGames };
    }).filter((guilds) => guilds.games.length !== 0)
  }, [userGuilds, userGames])

  return (
    <Stack bg={'#23252c'} space={"$4"} my={'$10'}>
      <Text mx={'$3'} textAlign="center" fos={'$10'} fontFamily={'$body'} color={'#8b89ac'}>Select Game</Text>
      <Text mb={'$3'} mx={'$3'} textAlign="center">Please invite PUGB Bot to your Discord server of choice and run the <Text color={'#707eff'}>@start</Text>  command to instantiate a game</Text>
      <Text textAlign="center" mb={'$3'} mx={'$3'}>Press <Text color={'#707eff'}>Refresh</Text> in order to get an updated list of servers that have active games</Text>
      {/* <Text>{JSON.stringify(userGames, null, 2)}</Text> */}
      <ScrollView horizontal={false} m={'$4'}>
        <Accordion space={'$4'} br={'$3'} type="multiple" collapsable={false}>
          {
            activeGuilds?.map((guild, index) => {
              return (
                <Accordion.Item key={guild.id} flex={1} bg={'#5462eb'} value={`a${index}`}>
                  <Accordion.Trigger flexDirection="row" justifyContent="space-between">
                    {({ open }: any) => (
                      <XStack gap={'$3'}>
                        <Avatar
                          circular size="$3"
                        >
                          <Avatar.Image src={`https://cdn.discordapp.com/icons/${guild.id}/${guild?.icon}.png`} />
                          <Avatar.Fallback bc="#55607b" />
                        </Avatar>
                        <Paragraph>{guild.name}</Paragraph>
                        <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                        </Square>
                      </XStack>
                    )}
                  </Accordion.Trigger>
                  <Accordion.Content>
                    {guild.games.map((game) => {
                      return (
                        <Stack gap={'$3'}
                          key={game.thread.id}
                          onPress={() => {
                            setSelectedGame(game);
                            console.log("RRRAAAAAHHHH", game)
                            router.push('/game');
                          }}>
                          {/* <YStack onPress={() => router.push(`/game/${game.thread.id}`)} key={game.thread.id} gap={'$3'}> */}
                          <Text>{game.thread.id}</Text>
                          <Text>{game.thread.name}</Text>
                        </Stack>
                      )
                    })}
                  </Accordion.Content>
                </Accordion.Item>
              )
            })
          }
        </Accordion>
      </ScrollView>
      <Button
        onPress={() => {
          console.log("REFRESH");
          guildRequestFn();
        }}
        bg={'#5462eb'}>Refresh
      </Button>
      <Button
        onPress={() => router.push('/')}
        bg={'#5462eb'}>Back
      </Button>
    </Stack >
  )
}
