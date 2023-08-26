import { useEffect, useState } from "react";
import { userDataAtom, userGuildsAtom } from "../lib/store";
import { UserDataDTO } from "../lib/types";
import { useAtom } from 'jotai';
import { Stack, Button, Text, View, XStack, YStack, Image } from 'tamagui';
import Logo from "../assets/logo.svg";

import { TouchableOpacity } from "react-native";
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'; ``
import * as WebBrowser from 'expo-web-browser';
import { Camera, CameraType } from 'expo-camera';
import EventSource, { EventSourceListener } from "react-native-sse";

WebBrowser.maybeCompleteAuthSession();
const discovery = {
  authorizationEndpoint: 'https://discord.com/oauth2/authorize',
  tokenEndpoint: 'https://discord.com/api/oauth2/token',
};
var scopes = ['identify', 'email', 'guilds',];
const CLIENT_ID = '1144562548084060241';

export default function Pugb() {
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;
  const [userData, setUserData] = useAtom(userDataAtom);
  const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: scopes,
      redirectUri: makeRedirectUri({
      }),
    },
    discovery
  );

  useEffect(() => {
    // console.log({ response });
    if (response?.type === 'success') {
      const { code, state } = response.params;
      const codeRequestFn = async () => {
        console.log({ SERVER_URL, code, state })
        try {
          // TODO validation
          const body = { code, state, code_verifier: request?.codeVerifier, redirect_uri: request?.redirectUri }
          const URL = `${SERVER_URL}/auth`
          const res = await fetch(URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          const jsonres: UserDataDTO = await res.json();
          let log = JSON.stringify(res, null, 2);
          let secondLog = JSON.stringify(request, null, 2);
          
          // console.log({ jsonres, log, secondLog});
          
          // setUserGuilds(jsonres.guilds);
          // const { guilds, ...userDataTemp } = jsonres;
          // setUserData(userDataTemp);
        }
        catch (e) {
          console.log(e);
        }
      };
      codeRequestFn();
    }
  }, [response, setUserData]);

  function startEventSource() {
    const eventSource = new EventSource(`${SERVER_URL}/game_sse`);
    eventSource.addEventListener('message', (event) => {
      console.log({ event });
    })
    eventSource.addEventListener('close', (event) => {
      console.log({ event })
    })
  }

  useEffect(() => {
  }, [])

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View flex={1} bg={'#23252c'} ai={'center'} jc={'center'}>
        <Button bg={'#5462eb'} onPress={requestPermission}>grant camera permissions</Button>
      </View>
    );
  }

  return (
    <Stack bg={'#23252c'} flex={1} jc={'center'} ai={'center'}>
      <Logo width={100} />
      <Button
        onPress={() => { promptAsync(); }}
        bg={'#5462eb'}>Login
      </Button>
      <Button
        onPress={() => { startEventSource() }}
        bg={'#5462eb'}>Test SSE
      </Button>
      <Stack>
        <YStack ai={'center'} jc={'center'}>
          < XStack ai={'flex-start'} bg={'#5462eb'} br={'$2'} mx={'$5'} shadowColor={'red'} borderWidth={'$1.5'} >
            <Image
              source={{
                uri: userData?.avatar
              }}
              zi={'$5'} w={100} h={100} borderRadius={'$2'}
            />
            <YStack zi={'$5'} pos={'absolute'} right={0} p={'$5'}>
              <Text ta={'left'} fos={'$6'} col={'#000'} color={'white'}>{userData?.username}</Text>

              {userGuilds?.map((guild) => {
                <Text color={'white'}>guilds {guild}</Text>
              })}
            </YStack>
          </XStack >
        </YStack >

        <View style={{ width: 500, height: 500, }}>
          <Camera style={{ width: 200, height: 200, borderRadius: 30 }} type={type}>
            <View style={{ width: 100, height: 100, borderRadius: 30 }}>
              <TouchableOpacity onPress={toggleCameraType}>
                <Text>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      </Stack>
      {userData &&
        <></>
      }

    </Stack >
  )
}