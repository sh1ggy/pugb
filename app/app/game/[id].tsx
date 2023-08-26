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
import { GameState, Player } from '../../lib/types';
import { GestureEvent, PinchGestureHandler, PinchGestureHandlerEventPayload } from 'react-native-gesture-handler';


export default function Game() {
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

  const [userData, setUserData] = useAtom(userDataAtom);
  const cameraRef = useRef<Camera | null>(null);
  const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<CameraCapturedPicture>();
  const [killee, setKillee] = useState<Player | null>(null);
  const [isImageSaving, setIsImageSaving] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [zoom, setZoom] = useState(0);
  const [dead, setDead] = useState(false);

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  function startEventSource() {
    const eventSource = new EventSource(`${SERVER_URL}/game_sse`);
    eventSource.addEventListener('message', (event) => {
      console.log({ event });
      setGameState(event.data);
    })
    eventSource.addEventListener('killfeed', (event) => {
      console.log({ event });
      setGameState(event.data);
    })
    eventSource.addEventListener('death', (event) => {
      console.log({ event });
      setDead(true);
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
    setCapturedImage(photo);
    setIsImageSaving(false);
  }

  const sendPicture = async () => {
    // TODO conditionaly render this button so it doesnt appear when killee isnt selected
    if (!capturedImage || !killee) return;
    console.log({ capturedImage, killee });
    const data = new FormData();
    // const fileName = capturedImage.uri.split('/').pop();
    // const fileType = fileName.split('.').pop();
    // https://github.com/expo/image-upload-example/issues/3#issuecomment-387263080
    const response = await fetch(capturedImage.uri);
    const picture = await response.blob();
    // https://medium.com/@mwillbanks/react-expo-a-journey-of-uploading-raw-image-data-to-s3-7f308ee6989e
    const imageData = new File([picture], `photo.jpg`);


    data.append('image', picture);
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
      console.log(JSON.stringify(e, null, 2));
    }
  }

  const changeZoom = (e: GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (e.nativeEvent.scale > 1) {
      setZoom(0.02);
    }
    if (e.nativeEvent.scale < 1 && zoom > 0) {
      setZoom(0);
    }
  }

  return (
    <>
      {isImageSaving &&
        // <Spinner pos={'absolute'} zi={'$5'} size="large" color="#5462eb"></Spinner>
        <View pos={'absolute'} bg={'black'} zi={'$5'} br={'$3'}>
          <Text p={'$3'} color="#5462eb">Taking Photo</Text>
        </View>
      }
      <YStack bg={'#23252c'} flex={1} jc={'center'} ai={'center'} space={'$3'}>
        <YStack ai={'center'} jc={'center'}>
          < XStack ai={'flex-start'} >
            <YStack zi={'$5'} p={'$2'} gap={'$3'}>
              <Text ta={'left'} fos={'$6'} p={'$2'} col={'#000'} color={'white'} fontFamily={'$body'}>{userData?.username}</Text>
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

        {!capturedImage ?
          <PinchGestureHandler onGestureEvent={(e) => { changeZoom(e) }}>
            <YStack>
              <Camera
                ref={cameraRef}
                type={type}
                style={{ width: 300, height: 400 }}
                autoFocus={!(Platform.OS == 'android')}
                onCameraReady={() => setIsCameraLoading(true)}
                zoom={zoom}
              />
              <Button bg={'black'} onPress={toggleCameraType}>Flip Camera</Button>
              <Button bg={'black'} my={'$3'} onPress={takePicture} disabled={isCameraLoading ? false : true}>Shoot</Button>
            </YStack>
          </PinchGestureHandler>
          :
          <YStack>
            <Image
              source={{
                uri: capturedImage?.uri
              }}
              zi={'$5'} w={300} h={400}
            />
            <Button bg={'black'} onPress={() => {
              setCapturedImage(undefined);
              setKillee(null);
            }}>Retake</Button>
            {killee &&
              <Button
                onPress={sendPicture}
                bg={'#8b89ac'}>Send Photo
              </Button>
            }
          </YStack>
        }

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
    </>
  )
}