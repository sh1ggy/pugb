import { router } from "expo-router";
import { Button, Stack, Text, XStack, YStack, Checkbox, ScrollView, Paragraph, Square } from "tamagui";
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
      <ScrollView>
        <Accordion space={'$4'} br={'$3'} overflow="hidden" width="$15" type="multiple">
          {
            userGuilds?.map((guild, index) => {
              return (
                <Accordion.Item key={guild.id} bg={'#5462eb'} value={`a${index}`}>
                  <Accordion.Trigger flexDirection="row" justifyContent="space-between">
                    {({ open }: any) => (
                      <>
                        <Paragraph>{guild.name}</Paragraph>
                        <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                        </Square>
                      </>
                    )}
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Paragraph onPress={() => router.push(`/game/${guild.name}`)}>
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
