import { FlatList, Image, StyleSheet, Text, View } from "react-native";

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
  const picturesFromRoute = route?.params?.pictures;
  const pictures =
    Array.isArray(picturesFromRoute) && picturesFromRoute.length > 0
      ? picturesFromRoute
      : Array.isArray(managedPictures) && managedPictures.length > 0
        ? managedPictures
        : normalizePictures(route?.params);

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.itemWrapper}>
        <View style={styles.itemContainer}>
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
    backgroundColor: "#12CEDB",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "flex-start",
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
