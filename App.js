import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useRef, useState } from "react";

import CameraScreen from "./src/screens/CameraScreen";
import HomeScreen from "./src/screens/HomeScreen";
import PictureListScreen from "./src/screens/PictureListScreen";

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

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Camera">
          {(props) => <CameraScreen {...props} addPicture={addPicture} />}
        </Stack.Screen>
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} pictures={pictures} />}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
