import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Image } from "expo-image";
import { Button, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import BlackFrame from "../components/BlackFrame";
import { removeBackground } from "@six33/react-native-bg-removal";

export default function CameraScreen({ addPicture }) {
  const navigation = useNavigation();

  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(null);
  const [facing, setFacing] = useState("back");

  const [zoom, setZoom] = useState(0);
  const [baseZoom, setBaseZoom] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Button onPress={requestPermission} title="カメラの起動を許可" />
      </View>
    );
  }

  async function takePicture() {
    try {
      setLoading(true);
      console.log("撮影開始");

      if (!camera) {
        console.log("cameraがnull");
        setLoading(false);
        return;
      }

      // 1. 写真撮影
      const photo = await camera.takePictureAsync();
      console.log("撮影成功", photo.uri);

      // 2. 背景透過処理
      const result = await removeBackground(photo.uri);
      console.log("背景透過完了", result);

      if (!result) {
        console.log("背景透過に失敗しました");
        setLoading(false);
        return;
      }

      // 3. 写真オブジェクト作成 & 登録
      const newPicture = {
        uri: result,
        createdAt: new Date().toISOString(),
      };

      // addPicture はApp.js側でidを付与して返さないため、
      // ここで仮idを生成しつつaddPictureに渡す
      const tempId = `${Date.now()}-temp`;
      const pictureWithId = { ...newPicture, id: tempId };
      addPicture?.(pictureWithId);

      setLoading(false);

      // 4. CreateStickerScreen へ遷移
      //    image: 背景透過済みURI, pictureId: App.jsで採番されるidと合わせるため
      //    App.jsのaddPictureがgeneratedIdを使っている場合、picturesリストから
      //    最新のidを取得するか、ここではtempIdを渡してCreateStickerScreen側でuriだけ使う運用もOK
      console.log("CreateStickerへ遷移");
      navigation.navigate("CreateSticker", {
        image: result,
        pictureId: tempId,
        createdAt: newPicture.createdAt,
      });
    } catch (e) {
      console.error("エラー:", e);
      setLoading(false);
    }
  }

  const onPanEvent = (event) => {
    const { translationY } = event.nativeEvent;
    let newZoom = baseZoom - translationY / 300;
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

        <BlackFrame />

        <View style={styles.captureContainer}>
          <TouchableOpacity onPress={takePicture} disabled={loading}>
            <Image
              source={require("../../assets/Frame 7.png")}
              style={[styles.image, loading && { opacity: 0.5 }]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.camera_text}>
            {loading ? "解析中..." : "被写体を枠内に収めて撮影してください。"}
          </Text>
        </View>

        <View style={styles.zoomContainer}>
          <Text style={styles.text}>Zoom: {(zoom * 100).toFixed(0)}%</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  captureContainer: { position: "absolute", bottom: 150, alignSelf: "center" },
  textContainer: { position: "absolute", top: 150, alignSelf: "center" },
  zoomContainer: {
    position: "absolute",
    bottom: 250,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 8,
  },
  text: { color: "white", fontSize: 18 },
  camera_text: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    width: 300,
  },
  image: { width: 80, height: 80 },
});