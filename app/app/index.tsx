import { useEffect, useState } from "react";
import { userDataAtom, userGuildsAtom, userGamesAtom } from "../lib/store";
import { JSONError, UserDataDTO } from "../lib/types";
import { useAtom } from 'jotai';
import { Stack, Button, Text, View, XStack, YStack, Image, Spinner } from 'tamagui';

import { Link } from 'expo-router';
import { router } from 'expo-router';


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
  const [userGames, setUserGames] = useAtom(userGamesAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [forceAuth, setForceAuth] = useState(false);

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

          console.log({ jsonres });

          setUserGuilds(jsonres.guilds);
          const { guilds, games, user } = jsonres;
          setUserData(user);
          setUserGames(games);
        }
        catch (e) {
          console.log(JSON.stringify(e, null, 2));
        }
      };
      codeRequestFn();
    }
  }, [response, setUserData]);

  useEffect(() => {
    const userRequestFn = async () => {
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
          setForceAuth(true);
          setIsLoading(false);
          return;
        }
        const succjson: UserDataDTO = jsonres;
        setIsLoading(false);
        let log = JSON.stringify(res, null, 2);
        let secondLog = JSON.stringify(request, null, 2);

        console.log({ succjson });

        setUserGuilds(succjson.guilds);
        const { guilds, games, user } = succjson;
        setUserData(user);
        setUserGames(games);
      }
      catch (e) {
        console.log("FORCE OAUTH", JSON.stringify(e, null, 2));
        // TODO handle error
        // const jsonres: JSONError | undefined = await (res?.json); 
        setForceAuth(true);
        setIsLoading(false);
      }
    }
    userRequestFn();
  }, [])

  return (
    <Stack bg={'#23252c'} space={"$4"} flex={1} jc={'center'} ai={'center'} gap={'$3'}>
      {isLoading ?
        <Spinner pos={'absolute'} zi={'$5'} size="large" color="#5462eb"></Spinner>
        :
        <>
          {forceAuth &&
            <>
              <Text mx={'$3'} textAlign="center" fos={'$5'} fontFamily={'$body'} color={'#8b89ac'}>Please sign in</Text>
              <Button
                onPress={() => { promptAsync(); }}
                bg={'#5462eb'}>Login
              </Button>
            </>
          }
          <Button
            onPress={() => router.push('/select')}
            bg={'#5462eb'}>Game Select
          </Button>
        </>
      }
    </Stack >
  )
}