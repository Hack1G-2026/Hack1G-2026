import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";

const { width, height } = Dimensions.get("window");
const DROP_ZONE_HEIGHT = Math.floor(height * 0.7);
const PHOTO_SIZE = 200;
const STACK_SPACING = 62;
const X_OFFSETS = [0, -38, 38, -22, 22];

function getTargetY(index) {
  const bottomPadding = 16;
  const y =
    DROP_ZONE_HEIGHT - PHOTO_SIZE - bottomPadding - index * STACK_SPACING;
  return Math.max(8, y);
}

function getTargetX(index) {
  return X_OFFSETS[index % X_OFFSETS.length];
}

export default function HomeScreen({ route, navigation, pictures }) {
  const message1 = "自分だけの好きを研ぎ澄ませ";
  const [fallingItems, setFallingItems] = useState([]);
  const knownIdsRef = useRef(new Set());
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const safePictures = Array.isArray(pictures) ? pictures : [];
    const currentIds = new Set(safePictures.map((item) => item.id));

    setFallingItems((prev) => prev.filter((item) => currentIds.has(item.id)));
    knownIdsRef.current = new Set(
      Array.from(knownIdsRef.current).filter((id) => currentIds.has(id)),
    );

    const unseenPictures = safePictures
      .filter(
        (item) => item?.id && item?.uri && !knownIdsRef.current.has(item.id),
      )
      .reverse();

    if (unseenPictures.length === 0) {
      if (!hasInitializedRef.current) hasInitializedRef.current = true;
      return;
    }

    setFallingItems((prev) => {
      const next = [...prev];

      unseenPictures.forEach((picture) => {
        const stackIndex = next.length;
        const targetY = getTargetY(stackIndex);
        const targetX = getTargetX(stackIndex);
        const animatedY = new Animated.Value(
          hasInitializedRef.current ? -PHOTO_SIZE : targetY,
        );

        next.push({
          id: picture.id,
          uri: picture.uri,
          animatedY,
          targetX,
        });

        knownIdsRef.current.add(picture.id);

        if (hasInitializedRef.current) {
          Animated.spring(animatedY, {
            toValue: targetY,
            useNativeDriver: true,
            bounciness: 8,
            speed: 1,
          }).start();
        }
      });

      return next;
    });

    if (!hasInitializedRef.current) hasInitializedRef.current = true;
  }, [pictures]);

  const goToPictureList = () => {
    navigation.navigate("PictureList", { pictures });
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        {fallingItems.map((item) => (
          <Animated.Image
            key={item.id}
            source={{ uri: item.uri }}
            resizeMode="contain"
            style={[
              styles.fallingImage,
              {
                transform: [
                  { translateY: item.animatedY },
                  { translateX: item.targetX },
                ],
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.mes}>{message1}</Text>
      <TouchableOpacity style={styles.button} onPress={goToPictureList}>
        <Text style={styles.buttonText}>写真一覧を見る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "black",
    paddingTop: 24,
  },
  box: {
    width: "100%",
    height: DROP_ZONE_HEIGHT,
    backgroundColor: "#00DAEB",
    borderRadius: 24,
    marginTop: 0,
    overflow: "hidden",
    position: "relative",
  },
  fallingImage: {
    position: "absolute",
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    top: 0,
    left: "50%",
    marginLeft: -PHOTO_SIZE / 2,
  },
  mes: {
    color: "white",
    fontSize: 18,
    marginTop: 50,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  buttonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
});
