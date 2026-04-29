import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useRef, useState } from "react";

import CameraScreen from "./src/screens/CameraScreen";
import HomeScreen from "./src/screens/HomeScreen";
import PictureListScreen from "./src/screens/PictureListScreen";
import CreateStickerScreen from "./src/screens/CreateStickerScreen";
import CreateLikeScreen from "./src/screens/CreateLikeScreen";
import CreateLikeResultScreen from "./src/screens/CreateLikeResultScreen";

const Stack = createStackNavigator();

export default function App() {
  const [pictures, setPictures] = useState([]);
  const pictureSequenceRef = useRef(0);

  const addPicture = (picture) => {
    pictureSequenceRef.current += 1;
    const generatedId = `${Date.now()}-${pictureSequenceRef.current}`;
    const normalizedPicture = {
      id: generatedId,
      uri: picture?.uri ?? "",
      createdAt: picture?.createdAt ?? new Date().toISOString(),
    };
    if (!normalizedPicture.uri) return;
    setPictures((prev) => [normalizedPicture, ...prev]);
  };

  const removePicture = (id) => {
    setPictures((prev) => prev.filter((item) => item.id !== id));
  };

  // Home画面の画像を全削除（CreateLikeResult完了時に呼ぶ）
  const clearPictures = () => {
    setPictures([]);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen {...props} pictures={pictures} clearPictures={clearPictures} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Camera">
          {(props) => <CameraScreen {...props} addPicture={addPicture} />}
        </Stack.Screen>

        <Stack.Screen name="PictureList">
          {(props) => (
            <PictureListScreen
              {...props}
              pictures={pictures}
              removePicture={removePicture}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateSticker">
          {(props) => (
            <CreateStickerScreen {...props} pictures={pictures} />
          )}
        </Stack.Screen>

        {/* 好きを分析: 振り＋合体 */}
        <Stack.Screen name="CreateLike">
          {(props) => <CreateLikeScreen {...props} />}
        </Stack.Screen>

        {/* 分析結果: 表示＋Homeリセット */}
        <Stack.Screen name="CreateLikeResult">
          {(props) => (
            <CreateLikeResultScreen {...props} clearPictures={clearPictures} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}