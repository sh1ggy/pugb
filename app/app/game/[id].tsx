import { Camera, CameraCapturedPicture, CameraPictureOptions, CameraType } from 'expo-camera';
import { useAtom } from 'jotai';
import { Platform, TouchableOpacity } from 'react-native';
import { Stack, Button, Text, View, XStack, YStack, Image, ScrollView, Spinner } from 'tamagui';
import { userDataAtom, userGuildsAtom } from '../../lib/store';
import { useEffect, useRef, useState } from 'react';
import { Link, router } from 'expo-router';
// import { players, userData } from '../../lib/mock'
import { players } from '../../lib/mock'
import { Avatar } from 'tamagui'
import { Player } from '../../lib/types';

export default function Game() {
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

  const [userData, setUserData] = useAtom(userDataAtom);
  const cameraRef = useRef<Camera | null>(null);
  const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<CameraCapturedPicture>();
  const [killee, setKillee] = useState<Player | null>(null);
  const [isImageSaving, setIsImageSaving] = useState<boolean>(false)
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
    if (!cameraRef.current) return
    setIsImageSaving(true);
    const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.1, skipProcessing: true, });
    setIsImageSaving(false);
    setCapturedImage(photo);
  }

  const sendPicture = async () => {
    if (!capturedImage || !killee) return;
    console.log({capturedImage,killee});
    const data = new FormData();
    // const fileName = capturedImage.uri.split('/').pop();
    // const fileType = fileName.split('.').pop();

    data.append('image', capturedImage.uri);
    data.append('title', "image");
    data.append('killee', killee.id as string);
    try {
      const URL = `${SERVER_URL}/api/shoot`
      console.log(JSON.stringify(data))
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
        < XStack ai={'flex-start'} >
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


      <Stack>
        {!capturedImage ?
          <YStack>
            <Camera
              ref={cameraRef}
              type={type}
              style={{ width: 200, height: 300 }}
              autoFocus={!(Platform.OS == 'android')}
            >
              {isImageSaving &&
                <Stack flex={1} ai={'center'} jc={'center'}>
                  <Spinner bg={'black'} br={'$3'} size="large" color="#5462eb"></Spinner>
                </Stack>
              }
            </Camera>
            <Button bg={'black'} onPress={toggleCameraType}>Flip Camera</Button>
            <Button bg={'black'} onPress={takePicture}>Shoot</Button>
          </YStack>
          :
          <YStack>
            <Image
              source={{
                uri: capturedImage?.uri
              }}
              zi={'$5'} w={200} h={300}
            />
            <Button bg={'black'} onPress={() => { setCapturedImage(undefined) }}>Retake</Button>
          </YStack>
        }
        <Button
          onPress={sendPicture}
          bg={'#8b89ac'}>Send Photo
        </Button>
      </Stack>

      {capturedImage && !dead &&
        <ScrollView maxHeight={'$6'} horizontal directionalLockEnabled={true} automaticallyAdjustContentInsets={false}>
          <XStack gap={'$2'} maxHeight={'$6'}>
            {!killee &&
              players?.map((player) => {
                return (
                  <Avatar key={player.id}
                    circular size="$6"
                    pressStyle={{ borderColor: '#5462eb', borderWidth: '$1' }}
                    onPress={() => setKillee(player)}>
                    <Avatar.Image src={player.avatar} />
                    <Avatar.Fallback bc="#55607b" />
                  </Avatar>
                )
              })
            }
            {killee &&
              <Avatar
                circular size="$6"
                pressStyle={{ borderColor: '#5462eb', borderWidth: '$1' }}
                onPress={() => setKillee(null)}>
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