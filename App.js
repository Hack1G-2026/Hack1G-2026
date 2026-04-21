import 'react-native-gesture-handler';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Image } from 'expo-image';
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import BlackFrame from './src/BlackFrame.js';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(null);
  const [facing, setFacing] = useState('back');

  // ⭐ ズーム用
  const [zoom, setZoom] = useState(0);
  const [baseZoom, setBaseZoom] = useState(0);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Button onPress={requestPermission} title="カメラの起動を許可" />
      </View>
    );
  }

  async function takePicture() {
    if (camera) {
      const photo = await camera.takePictureAsync();
      console.log(photo);
    }
  }

  function toggleCamera() {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }

  // スワイプズーム処理
  const onPanEvent = (event) => {
    const { translationY } = event.nativeEvent;

    // 上にスワイプでズームイン（マイナスになるので反転）
    let newZoom = baseZoom - translationY / 300;

    // 0〜1に制限
    if (newZoom > 1) newZoom = 1;
    if (newZoom < 0) newZoom = 0;

    setZoom(newZoom);
  };

  const onPanStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setBaseZoom(zoom);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* カメラ（スワイプズーム対応） */}
        <PanGestureHandler
          onGestureEvent={onPanEvent}
          onHandlerStateChange={onPanStateChange}
        >
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            zoom={zoom}
            ref={(ref) => setCamera(ref)}
          />
        </PanGestureHandler>

        {/* 黒枠 */}
        <BlackFrame />

        {/* 撮影ボタン */}
        <View style={styles.captureContainer}>
          <TouchableOpacity onPress={takePicture}>
            <Image
              source={require('./assets/Frame 7.png')}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>

        {/* カメラ切り替え
        <View style={styles.switchContainer}>
          <TouchableOpacity onPress={toggleCamera}>
            <Text style={styles.text}>切替</Text>
          </TouchableOpacity>
        </View> */}

        {/* テキスト */}
        <View style={styles.textContainer}>
          <Text style={styles.camera_text}>
            Refine your own unique tastes
          </Text>
        </View>

        {/* （任意）ズーム表示 */}
        <View style={styles.zoomContainer}>
          <Text style={styles.text}>
            Zoom: {(zoom * 100).toFixed(0)}%
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  captureContainer: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  switchContainer: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 10,
  },
  textContainer: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
  },
  zoomContainer: {
    position: 'absolute',
    bottom: 250,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 8,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  camera_text: {
    color: 'white',
    fontSize: 18,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
});