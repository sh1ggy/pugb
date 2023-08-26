import { Camera, CameraType } from 'expo-camera';
import { useAtom } from 'jotai';
import { TouchableOpacity } from 'react-native';
import { Stack, Button, Text, View, XStack, YStack, Image } from 'tamagui';
import { userDataAtom, userGuildsAtom } from '../../lib/store';
import { useState } from 'react';
import { Link } from 'expo-router';

export default function Game() {
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

  const [userData, setUserData] = useAtom(userDataAtom);
  const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  function startEventSource() {
    const eventSource = new EventSource(`${SERVER_URL}/game_sse`);
    eventSource.addEventListener('message', (event) => {
      console.log({ event });
    })
    eventSource.addEventListener('close', (event) => {
      console.log({ event })
    })
  }

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
      
      <Link href="/">Go back</Link>
    </Stack>
  )
}