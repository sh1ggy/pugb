import { Camera, CameraCapturedPicture, CameraPictureOptions, CameraType } from 'expo-camera';
import { useAtom } from 'jotai';
import { Platform, TouchableOpacity } from 'react-native';
import { Stack, Button, Text, View, XStack, YStack, Image, ScrollView, Spinner } from 'tamagui';
import { selectedGameAtom, userDataAtom, userGamesAtom, userGuildsAtom } from '../../lib/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
// import { players } from '../../lib/mock'
// import { game, players } from '../../lib/mock'
// import { game } from '../../lib/mock'
import { Avatar } from 'tamagui'
import { GameState, Player, PlayerState } from '../../lib/types';
import { GestureEvent, PinchGestureHandler, PinchGestureHandlerEventPayload } from 'react-native-gesture-handler';
// import { userData } from '../../lib/mock';

export default function Game() {
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;
  // const { id, players } = useLocalSearchParams();

  const [userData, setUserData] = useAtom(userDataAtom);
  const [userGames, setUserGames] = useAtom(userGamesAtom);
  const [userGuilds, setUserGuilds] = useAtom(userGuildsAtom);
  const cameraRef = useRef<Camera | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<CameraCapturedPicture>();
  const [killee, setKillee] = useState<Player | null>(null);
  const [isImageSaving, setIsImageSaving] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [zoom, setZoom] = useState(0);
  const [dead, setDead] = useState(false);
  const [showKillFeed, setShowKillFeed] = useState(false);
  const [selectedGame, setSelectedGame] = useAtom(selectedGameAtom);

  const players = useMemo(() => {
    if (!selectedGame) return [];
    console.log("change");
    const players = selectedGame.state.players.filter((p) => p.state === "Alive");
    console.log(players, selectedGame.state.players);
    return players;
  }, [selectedGame])

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
    console.log({ capturedImage });
    const data = new FormData();
    // const response = await fetch(capturedImage.uri);
    // const picture = await response.blob();
    // https://github.com/expo/image-upload-example/issues/3#issuecomment-387263080
    // https://medium.com/@mwillbanks/react-expo-a-journey-of-uploading-raw-image-data-to-s3-7f308ee6989e

    //@ts-ignore
    data.append('image', {
      uri: capturedImage.uri,
      name: "x",
      type: "jpg"
    });

    data.append('title', "image");
    if (!dead) {
      data.append('killee', killee.id as string);
    }
    else {
      data.append('resPlayer', userData?.id as string);
    }
    try {
      const URL = dead ? `${SERVER_URL}/api/${selectedGame?.thread.id}/revive/${userData?.id}` : `${SERVER_URL}/api/${selectedGame?.thread.id}/shoot/${userData?.id}`
      console.log(JSON.stringify(data))
      const res = await fetch(URL, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(JSON.stringify(res));
      const jsonres = await res.json();
      let log = JSON.stringify(res, null, 2);
      console.log(log);
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
        <View pos={'absolute'} bg={'black'} zi={'$5'} br={'$3'}>
          <Text p={'$3'} color="#5462eb">Taking Photo</Text>
        </View>
      }
      <YStack bg={'#23252c'} flex={1} jc={'center'} ai={'center'} space={'$3'}>
        <YStack ai={'center'} jc={'center'}>
          {/* <Text>{JSON.stringify(selectedGame?.state.players, null, 2)}</Text> */}
          {/* <Text>{JSON.stringify(players, null, 2)}</Text> */}
          < XStack ai={'flex-start'} bg={'#8b89ac'} br={'$3'} p={'$1.5'}>
            <Avatar circular size="$3">
              <Avatar.Image src={`https://cdn.discordapp.com/avatars/${userData?.id}/${userData?.avatar}.png`} />
              <Avatar.Fallback bc="#8b89ac" />
            </Avatar>
            <Text ta={'left'} fos={'$6'} p={'$2'} col={'#000'} color={'white'} textAlign='center' fontFamily={'$body'}>{userData?.username}</Text>
          </XStack >
          <YStack zi={'$5'} p={'$2'} gap={'$3'}>
            {
              dead &&
              <>
                <Text ta={'center'} fos={'$4'} p={'$1'} col={'#000'} color={'#e06c75'} fontFamily={'$body'}>You are dead, killed by {"xxx"}</Text>
                <Text ta={'center'} fos={'$1'} p={'$1'} col={'#000'} color={'white'}>Take a selfie at McDonalds to revive yourself</Text>
              </>
            }
          </YStack>
          {/* <Button
          onPress={() => { startEventSource() }}
          bg={'#5462eb'}>Test SSE
        </Button> */}
        </YStack >

        {!capturedImage ?
          <PinchGestureHandler onGestureEvent={(e) => { changeZoom(e) }}>
            <YStack>
              {showKillFeed ?
                <YStack w={300} h={400} bg={'#8b89ac'} p={'$3'}>
                  <ScrollView>
                    {
                      selectedGame?.state.players.map((player) => (
                        <>
                          <Avatar circular size="$3">
                            <Avatar.Image src={`https://cdn.discordapp.com/avatars/${player?.id}/${player?.avatar}.png`} />
                            <Avatar.Fallback bc="#8b89ac" />
                          </Avatar>
                          <Text>{player.username}</Text>
                          <Text>{player.state}</Text>
                        </>
                      ))
                    }
                    {/* <Text>{JSON.stringify(selectedGame)}</Text> */}
                    <Text>{JSON.stringify(selectedGame?.state.players)}</Text>
                  </ScrollView>

                  {/* {gameState.killFeed.map((kill) => {
                    <XStack>
                      <Text>{kill.time}</Text>
                      <Text>{kill.killerId}</Text>
                      <Text>{kill.killeeId}</Text>
                    </XStack>
                  })} */}
                </YStack>
                :
                <>
                  < Camera
                    ref={cameraRef}
                    type={type}
                    style={{ width: 300, height: 400 }}
                    autoFocus={!(Platform.OS == 'android')}
                    onCameraReady={() => setIsCameraLoading(true)}
                    zoom={zoom}
                  />
                </>
              }
              <XStack>
                <Button flex={1} fontSize={'$2'} bg={'black'} onPress={() => setShowKillFeed(!showKillFeed)}>{showKillFeed ? "Camera" : "Kill Feed"}</Button>
                {!showKillFeed &&
                  <Button fontSize={'$2'} bg={'black'} onPress={toggleCameraType}>Flip Camera</Button>
                }
              </XStack>
              {!showKillFeed &&
                < Button bg={'black'} my={'$3'} onPress={takePicture} disabled={isCameraLoading ? false : true}>Shoot</Button>
              }
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
            <XStack>
              <Button flex={1} bg={'black'} onPress={() => {
                setCapturedImage(undefined);
                setKillee(null);
              }}>Retake</Button>
              {killee &&
                <Button
                  onPress={sendPicture}
                  bg={'#8b89ac'}>Send Photo
                </Button>
              }
            </XStack>
          </YStack>
        }

        {capturedImage && !dead &&
          <ScrollView maxHeight={'$6'} horizontal directionalLockEnabled={true} automaticallyAdjustContentInsets={false}>
            <XStack gap={'$2'} maxHeight={'$6'}>
              {killee &&
                <Avatar
                  circular size="$6"
                  pressStyle={{ borderColor: '#5462eb', borderWidth: '$1' }}
                  onPress={() => setKillee(null)}>
                  <Avatar.Image src={`https://cdn.discordapp.com/avatars/${killee?.id}/${killee?.avatar}.png`} />
                  <Avatar.Fallback bc="#55607b" />
                </Avatar>
              }
              {(killee == null && players) &&
                players.map((player) => {
                  return (
                    <Avatar key={player.id}
                      circular size="$6"
                      pressStyle={{ borderColor: '#5462eb', borderWidth: '$1' }}
                      onPress={() => setKillee(player)}>
                      <Avatar.Image src={`https://cdn.discordapp.com/avatars/${player?.id}/${player?.avatar}.png`} />
                      <Avatar.Fallback bc="#55607b" />
                    </Avatar>
                  )
                })
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