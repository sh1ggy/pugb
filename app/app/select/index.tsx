import { router } from "expo-router";
import { Button, Stack, Text, XStack, YStack, Checkbox, ScrollView, Paragraph, Square, Avatar } from "tamagui";
import { userGamesAtom, userGuildsAtom } from "../../lib/store";
import { useAtom } from "jotai";
import { userGuilds } from "../../lib/mock";
import React, { useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Accordion } from 'tamagui';
import { ChevronDown } from "@tamagui/lucide-icons";
import { JSONError, UserDataDTO } from "../../lib/types";

export default function Select() {
  // const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const [isLoading, setIsLoading] = useState(false);
  // const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const [userGames, setUserGames] = useAtom(userGamesAtom);

  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

  const guildRequestFn = async () => {
    let res;
    try {
      // TODO validation
      const URL = `${SERVER_URL}/api/get_user`
      setIsLoading(true);
      res = await fetch(URL);
      const jsonres: any = await res.json();
      if (jsonres.error) {
        const errjson: JSONError = jsonres;
        console.log(JSON.stringify(errjson, null, 2))
        setIsLoading(false);
        return;
      }
      const succjson: UserDataDTO = jsonres;
      setIsLoading(false);
      console.log({ succjson });

      // setUserGuilds(succjson.guilds);
    }
    catch (e) {
      console.log(JSON.stringify(e, null, 2));
    }
  }

  useMemo(() => {
    
  }, [])

  return (
    <Stack bg={'#23252c'} space={"$4"} my={'$10'}>
      <Text mx={'$3'} textAlign="center" fos={'$10'} fontFamily={'$body'} color={'#8b89ac'}>Select Game</Text>
      <Text mb={'$3'} mx={'$3'} textAlign="center">Please invite PUGB Bot to your Discord server of choice and run the <Text color={'#707eff'}>@start</Text>  command to instantiate a game</Text>
      <Text textAlign="center" mb={'$3'} mx={'$3'}>Press <Text color={'#707eff'}>Refresh</Text> in order to get an updated list of servers that have active games</Text>
      <ScrollView horizontal={false} m={'$4'}>
        <Accordion space={'$4'} br={'$3'} type="multiple">
          {
            userGuilds?.map((guild, index) => {
              return (
                <Accordion.Item key={guild.id} flex={1} bg={'#5462eb'} value={`a${index}`} onPress={() => router.push(`/game/${guild.name}`)}>
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
                    <Paragraph>
                      {guild.id}
                    </Paragraph>
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
