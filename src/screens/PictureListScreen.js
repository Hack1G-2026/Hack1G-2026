import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { getColors } from "react-native-image-colors";

function formatDate(value) {
  if (!value) return "日付なし";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日付なし";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function normalizePictures(routeParams) {
  const picturesParam = routeParams?.pictures;
  const singleImage = routeParams?.image;
  const nowIso = new Date().toISOString();

  if (Array.isArray(picturesParam) && picturesParam.length > 0) {
    return picturesParam
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            id: String(index + 1),
            uri: item,
            createdAt: nowIso,
          };
        }

        return {
          id: String(item?.id ?? index + 1),
          uri: item?.uri ?? "",
          createdAt: item?.createdAt ?? nowIso,
        };
      })
      .filter((item) => item.uri);
  }

  if (singleImage) {
    return [
      {
        id: "1",
        uri: singleImage,
        createdAt: nowIso,
      },
    ];
  }

  return [];
}

export default function PictureListScreen({
  route,
  pictures: managedPictures,
}) {
  const [extractedColors, setExtractedColors] = useState({}); // 各画像の色を保持

  const picturesFromRoute = route?.params?.pictures;
  const pictures =
    Array.isArray(picturesFromRoute) && picturesFromRoute.length > 0
      ? picturesFromRoute
      : Array.isArray(managedPictures) && managedPictures.length > 0
        ? managedPictures
        : normalizePictures(route?.params);

  // 画像から色を抽出する処理
  useEffect(() => {
    const fetchColors = async () => {
      const colorMap = { ...extractedColors };
      let updated = false;

      for (const item of pictures) {
        if (!item.uri || colorMap[item.id]) continue;

        try {
          // --- パスの整形処理を追加 ---
          let imageUri = item.uri;
          if (imageUri.startsWith('file:/') && !imageUri.startsWith('file:///')) {
            imageUri = imageUri.replace('file:/', 'file:///');
          }
          // --------------------------

          const result = await getColors(imageUri, {
            fallback: "#12CEDB",
            cache: true,
            key: item.id,
          });

          let color;
          if (result.platform === "android") {
            color = result.dominant || result.average || "#12CEDB";
          } else {
            color = result.background || "#12CEDB";
          }

          colorMap[item.id] = color;
          updated = true;
        } catch (e) {
          console.warn(`Color extraction failed for: ${item.uri}`, e);
          // 失敗してもデフォルト色を入れて、何度も同じ画像で失敗し続けないようにする
          colorMap[item.id] = "#12CEDB";
          updated = true;
        }
      }

      if (updated) {
        setExtractedColors(colorMap);
      }
    };

    if (pictures.length > 0) {
      fetchColors();
    }
  }, [pictures]);

  const renderItem = ({ item, index }) => {
    // 抽出された色があれば適用、なければデフォルト色
    const dynamicBackgroundColor = extractedColors[item.id] || "#12CEDB";

    return (
      <View style={styles.itemWrapper}>
        <View
          style={[
            styles.itemContainer,
            { backgroundColor: dynamicBackgroundColor },
          ]}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />

          <View style={styles.metaContainer}>
            <Text style={styles.numberText}>
              No.{String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (pictures.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>表示できる写真がありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pictures}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00DAEB",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  itemWrapper: {
    width: "49%",
    marginBottom: 10,
  },
  itemContainer: {
    // backgroundColor は動的に指定するため削除
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "flex-start",
    // 少し影をつけると抽出した色が馴染みやすくなります
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewImage: {
    width: "62%",
    height: "62%",
    backgroundColor: "transparent",
    borderRadius: 999,
    marginTop: 4,
  },
  metaContainer: {
    width: "100%",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  numberText: {
    color: "#001114",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 1,
  },
  dateText: {
    color: "#003A41",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00DAEB",
  },
  emptyText: {
    color: "#003A41",
    fontSize: 16,
  },
});