import { router } from "expo-router";
import { Button, Stack, Text, XStack, YStack, Checkbox } from "tamagui";
import { userGuildsAtom } from "../../lib/store";
import { useAtom } from "jotai";
import { userGuilds } from "../../lib/mock";
import React from "react";
import { TouchableOpacity } from "react-native";

// import Checkbox from 'expo-checkbox';

export default function Select() {
  // const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  return (
    <Stack bg={'#23252c'} space={"$4"} flex={1} jc={'center'} ai={'center'}>
      <YStack m={'$9'} space={'$4'} br={'$3'}>
        {userGuilds?.map((guild) => {
          return (
            <XStack key={guild.id} bg={'black'} px={'$3'} br={'$3'} ai={'center'}>
              <TouchableOpacity onPress={() => router.push(`/camera/${guild.name}`)}>
                <Text fos={'$5'} p={'$3'} color={'white'}>{guild.name}</Text>
              </TouchableOpacity>
            </XStack>
          )
        })}
      </YStack>
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
