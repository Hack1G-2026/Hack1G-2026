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
  const y = DROP_ZONE_HEIGHT - PHOTO_SIZE - bottomPadding - index * STACK_SPACING;
  return Math.max(8, y);
}

function getTargetX(index) {
  return X_OFFSETS[index % X_OFFSETS.length];
}

export default function HomeScreen({ route, navigation, pictures, clearPictures }) {
  const message1 = "自分だけの好きを研ぎ澄ませ";
  const [fallingItems, setFallingItems] = useState([]);

  // 修正：1枚以上あればボタンを有効化
  const createLikeEnabled = pictures && pictures.length > 0;

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
      .filter((item) => item?.id && item?.uri && !knownIdsRef.current.has(item.id))
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
        const animatedY = new Animated.Value(hasInitializedRef.current ? -PHOTO_SIZE : targetY);

        next.push({ id: picture.id, uri: picture.uri, animatedY, targetX });
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

  const goToCreateLike = () => {
    if (!createLikeEnabled) return;
    navigation.navigate("CreateLike", { pictures });
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
              { transform: [{ translateY: item.animatedY }, { translateX: item.targetX }] },
            ]}
          />
        ))}
      </View>

      <Text style={styles.mes}>{message1}</Text>

      <TouchableOpacity
        style={[styles.createLikeBtn, !createLikeEnabled && styles.createLikeBtnDisabled]}
        onPress={goToCreateLike}
        disabled={!createLikeEnabled}
      >
        <Text style={[styles.createLikeBtnText, !createLikeEnabled && styles.createLikeBtnTextDisabled]}>
          ✦ 好きを分析
        </Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("PictureList", { pictures })}>
          <View style={styles.gridIcon}><View style={styles.gridRow}><View style={styles.gridCell} /><View style={styles.gridCell} /></View></View>
          <Text style={styles.tabLabel}>一覧</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItemCenter} onPress={() => navigation.navigate("Camera")}>
          <View style={styles.cameraBtn}><View style={styles.cameraBody}><View style={styles.cameraLens} /></View></View>
          <Text style={styles.tabLabelCenter}>撮影</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => { }}>
          <Text style={styles.tabLabel}>お気に入り</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", paddingTop: 24, alignItems: "center" },
  box: { width: "100%", height: DROP_ZONE_HEIGHT, backgroundColor: "#00DAEB", borderRadius: 24, overflow: "hidden" },
  fallingImage: { position: "absolute", width: PHOTO_SIZE, height: PHOTO_SIZE, left: "50%", marginLeft: -PHOTO_SIZE / 2 },
  mes: { color: "white", fontSize: 18, marginTop: 16 },
  createLikeBtn: { position: "absolute", right: 20, bottom: 100, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: "#00DAEB", borderRadius: 50 },
  createLikeBtnDisabled: { backgroundColor: "#2a2a2a" },
  createLikeBtnText: { color: "#111", fontSize: 13, fontWeight: "800" },
  createLikeBtnTextDisabled: { color: "rgba(255,255,255,0.2)" },
  tabBar: { position: "absolute", bottom: 0, width: "100%", height: 80, backgroundColor: "#1C1C1E", flexDirection: "row", alignItems: "center", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  tabItem: { flex: 1, alignItems: "center" },
  tabItemCenter: { flex: 1, alignItems: "center" },
  cameraBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#00DAEB", alignItems: "center", justifyContent: "center" },
  cameraBody: { width: 26, height: 18, backgroundColor: "#111", borderRadius: 4, justifyContent: "center", alignItems: "center" },
  cameraLens: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#333" },
  tabLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 4 },
  tabLabelCenter: { color: "#00DAEB", fontSize: 10, fontWeight: "700", marginTop: 4 },
  gridIcon: { gap: 2 },
  gridRow: { flexDirection: "row", gap: 2 },
  gridCell: { width: 10, height: 10, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 2 }
});