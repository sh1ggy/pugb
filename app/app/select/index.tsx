import { router } from "expo-router";
import { Button, Stack, Text, XStack, YStack, Checkbox, ScrollView, Paragraph, Square, Avatar } from "tamagui";
import { userGuildsAtom } from "../../lib/store";
import { useAtom } from "jotai";
import { userGuilds } from "../../lib/mock";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Accordion } from 'tamagui';

export default function Select() {
  // const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);

  return (
    <Stack bg={'#23252c'} space={"$4"} flex={1} jc={'center'} ai={'center'} my={'$10'}>
      <Text mx={'$3'} textAlign="center" fos={'$10'} fontFamily={'$body'} color={'#8b89ac'}>Select Game</Text>
      <Text mb={'$3'} mx={'$3'} textAlign="center">Please invite PUGB Bot to your Discord server of choice and run the <Text color={'#707eff'}>@start</Text>  command to instantiate a game</Text>
      <Text textAlign="center" mb={'$3'} mx={'$3'}>Press <Text color={'#707eff'}>Refresh</Text> in order to get an updated list of servers that have active games</Text>
      <ScrollView horizontal={false} px={'$10'}>
        <Accordion space={'$4'} br={'$3'} overflow="hidden" width="$15" type="multiple">
          {
            userGuilds?.map((guild, index) => {
              return (
                <Accordion.Item key={guild.id} bg={'#5462eb'} value={`a${index}`} onPress={() => router.push(`/game/${guild.name}`)}>
                  <Accordion.Trigger flexDirection="row" justifyContent="space-between">
                    {({ open }: any) => (
                      <XStack gap={'$3'}>
                        <Avatar
                          circular size="$3"
                          >
                          <Avatar.Image src={guild?.icon} />
                          <Avatar.Fallback bc="red" />
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
        onPress={() => console.log('refresh')}
        bg={'#5462eb'}>Refresh
      </Button>
      <Button
        onPress={() => router.push('/')}
        bg={'#5462eb'}>Back
      </Button>
    </Stack >
  )
}
