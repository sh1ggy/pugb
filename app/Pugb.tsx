import { useEffect, useState } from "react";
import { userDataAtom, userGuildsAtom } from "./lib/store";
import { UserDataDTO } from "./lib/types";
import { useAtom } from 'jotai';
import { Stack, Button, Text, View } from 'tamagui';
import Logo from "./assets/logo.svg";

import { TouchableOpacity, StyleSheet } from "react-native";
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
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
      {userData &&
        <Stack>
          <Text>{userData}</Text>
          <Text>{userGuilds}</Text>
        </Stack>
      }

      <View style={{ width: 100, height: 100 }}>
        <Camera style={{ width: 100, height: 100 }} type={type}>
          <View style={{ width: 100, height: 100 }}>
            <TouchableOpacity onPress={toggleCameraType}>
              <Text>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    </Stack >
  )
}