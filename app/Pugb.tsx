import Logo from "./assets/logo.svg";
import { Stack, Button, Text } from 'tamagui';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo } from "react";
import { useAtom } from 'jotai';
import { userDataAtom, userGuildsAtom } from "./lib/store";
import { UserDataDTO } from "./lib/types";
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
    console.log({ response });
    if (response?.type === 'success') {
      const { code, state } = response.params;
      const codeRequestFn = async () => {
        console.log({ SERVER_URL, code, state })
        try {
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
          setUserGuilds(jsonres.guilds);
          const { guilds, ...userDataTemp } = jsonres;
          setUserData(userDataTemp);
        }
        catch (e) {
          console.log(e);
        }

      };
      codeRequestFn();
    }
  }, [response, setUserData]);

  return (
    <Stack bg={'#23252c'} flex={1} jc={'center'} ai={'center'}>
      <Logo width={100} />
      <Button
        onPress={() => { promptAsync(); }}
        bg={'#5462eb'}>Login
      </Button>
      {userData &&
        <Stack>
          <Text>{userData}</Text>
        </Stack>

      }
    </Stack>
  )
}