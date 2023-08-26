import { Camera, CameraCapturedPicture, CameraPictureOptions, CameraType } from 'expo-camera';
import { useAtom } from 'jotai';
import { TouchableOpacity } from 'react-native';
import { Stack, Button, Text, View, XStack, YStack, Image, ScrollView } from 'tamagui';
import { userDataAtom, userGuildsAtom } from '../../lib/store';
import { useRef, useState } from 'react';
import { Link, router } from 'expo-router';
// import { players, userData } from '../../lib/mock'
import { players } from '../../lib/mock'
import { Avatar } from 'tamagui'
import { Player } from '../../lib/types';

export default function Game() {
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

  const [userData, setUserData] = useAtom(userDataAtom);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<CameraCapturedPicture>();
  const [killee, setKillee] = useState<Player | null>(null);
  const dead = false;

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

  const takePicture = async () => {
    if (!camera) return
    const photo = await camera.takePictureAsync({ base64: true });
    setCapturedImage(photo);
  }

  const sendPicture = async () => {
    if (!capturedImage || !killee) return;
    const data = new FormData();
    data.append('image', capturedImage.uri);
    data.append('killee', killee.id as string);
    try {
      const URL = `${SERVER_URL}/auth`
      const res = await fetch(URL, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res);
      const jsonres = await res.json();
      let log = JSON.stringify(res, null, 2);
      console.log({ jsonres });
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
    <YStack bg={'#23252c'} flex={1} jc={'center'} ai={'center'} space={'$3'}>

      <YStack ai={'center'} jc={'center'}>
        < XStack ai={'flex-start'} borderWidth={'$.5'} >
          <YStack zi={'$5'} p={'$2'} gap={'$3'}>
            <Text ta={'left'} fos={'$6'} p={'$2'} col={'#000'} color={'white'}>{userData?.username}</Text>
            {
              dead &&
              <>
                <Text ta={'center'} fos={'$5'} p={'$2'} col={'#000'} color={'white'}>You are dead</Text>
                <Text ta={'center'} fos={'$2'} p={'$2'} col={'#000'} color={'white'}>Take a selfie at McDonalds to revive yourself</Text>
              </>
            }

            {userGuilds?.map((guild) => {
              <Text color={'white'}>guilds {guild}</Text>
            })}
          </YStack>
        </XStack >
        {/* <Button
          onPress={() => { startEventSource() }}
          bg={'#5462eb'}>Test SSE
        </Button> */}
      </YStack >

      <XStack>
        <YStack ai={'center'} br={'$3'} onPress={toggleCameraType}>
          <Camera
            ref={(r) => {
              setCamera(r);
            }}
            type={type}
            style={{ width: 180, height: 180, borderRadius: 30 }}
          >
          </Camera>
        </YStack>
        {capturedImage ?
          <Image
            source={{
              uri: capturedImage?.uri
            }}
            zi={'$5'} flex={1} borderRadius={'$2'}
          />
          :
          <Stack flex={1} bg={'#8b89ac'} />
        }
      </XStack>

      <XStack gap={'$2'}>
        <Button
          onPress={takePicture}
          bg={'#8b89ac'}>Take Photo
        </Button>
        <Button
          onPress={sendPicture}
          bg={'#8b89ac'}>Send Photo
        </Button>
      </XStack>

      {capturedImage && !dead &&
        <ScrollView maxHeight={'$6'} horizontal directionalLockEnabled={true} automaticallyAdjustContentInsets={false}>
          <XStack gap={'$2'} maxHeight={'$6'}>
            {!killee &&
              players?.map((player) => {
                return (
                  <Avatar key={player.id}
                    circular size="$6"
                    borderColor={killee ? '#5462eb' : ""}
                    borderWidth={killee ? '$1' : ""}
                    pressStyle={{ borderColor: '#5462eb', borderWidth: '$1' }}
                    onPress={(e) => {
                      setKillee(player);
                      console.log(killee);
                    }}>
                    <Avatar.Image src={player.avatar} />
                    <Avatar.Fallback bc="red" />
                  </Avatar>
                )
              })
            }
            {killee &&
              <Avatar
                circular size="$6"
                borderColor='#5462eb'
                pressStyle={{ borderColor: '#8b89ac', borderWidth: '$1' }}
                onPress={(e) => {
                  setKillee(null);
                  console.log(killee);
                }}>
                <Avatar.Image src={killee?.avatar} />
                <Avatar.Fallback bc="red" />
              </Avatar>
            }
          </XStack>
        </ScrollView>
      }

      <Button
        onPress={() => router.push('/select')}
        bg={'#5462eb'}>Back
      </Button>
    </YStack >
  )
}