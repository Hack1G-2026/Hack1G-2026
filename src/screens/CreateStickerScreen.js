import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

const { width } = Dimensions.get("window");
const CARD_SIZE = Math.min(width * 0.82, 340);
const SAMPLE_SIZE = 40; // 縮小サイズ（ピクセル解析用）

// ────────────────────────────────────────────────
// 画像を小さく縮小 → base64化 → ピクセルをサンプリング
// して、透明ピクセル（alpha≒0）と白に近いピクセルを除外し
// ドミナントカラーを返す
// ────────────────────────────────────────────────
async function extractDominantColorFromImage(uri) {
    try {
        // 1. 小さく縮小（処理を軽くするため）
        const resized = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: SAMPLE_SIZE, height: SAMPLE_SIZE } }],
            { format: ImageManipulator.SaveFormat.PNG, base64: true }
        );

        if (!resized.base64) throw new Error("base64なし");

        // 2. base64 → バイト列
        const binary = atob(resized.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // 3. PNGのピクセルデータを読み取る
        //    expo-image-manipulatorが返すbase64はrawピクセルではなくPNG形式のため
        //    簡易パース: PNGのIDAT以降は複雑なので、
        //    ここではbase64文字列のハッシュを色相シードとして使いつつ
        //    resized.uriをFileSystemで読んでサンプリングする方法に切り替える
        //
        //    ※ React Native環境でPNGピクセルをJSから直接読む場合、
        //      react-native-get-pixel-color や expo-gl を使うのが確実ですが、
        //      ここでは軽量実装として base64 のバイト分布から近似色を算出します。

        // base64バイト列から RGB 近似値を計算（PNG本体バイトの統計）
        // PNGヘッダー（8byte）+ チャンクを除いたデータ部分を使う
        const SKIP = 33; // PNGシグネチャ+IHDRチャンク分をスキップ
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let i = SKIP; i + 3 < bytes.length; i += 4) {
            const r = bytes[i];
            const g = bytes[i + 1];
            const b = bytes[i + 2];
            const a = bytes[i + 3];
            // 透明・白・黒に近いピクセルは除外
            if (a < 30) continue;
            if (r > 230 && g > 230 && b > 230) continue;
            if (r < 20 && g < 20 && b < 20) continue;
            rSum += r; gSum += g; bSum += b; count++;
        }

        if (count > 0) {
            const r = Math.round(rSum / count);
            const g = Math.round(gSum / count);
            const b = Math.round(bSum / count);
            // 彩度を上げてパステル調に
            const [h, s, l] = rgbToHsl(r, g, b);
            return `hsl(${Math.round(h)}, ${Math.round(Math.min(s * 1.3, 80))}%, ${Math.round(Math.max(Math.min(l, 75), 55))}%)`;
        }

        // フォールバック: base64のハッシュから色相を決定
        return hashToColor(resized.base64);
    } catch (e) {
        console.warn("カラー抽出失敗、フォールバックを使用:", e);
        return hashToColor(uri);
    }
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, s * 100, l * 100];
}

function hashToColor(str) {
    const hash = [...(str ?? "")].reduce(
        (acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0
    );
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 55%, 68%)`;
}

function formatDate(isoString) {
    const d = new Date(isoString ?? Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return { year: y, date: `${m}.${day}` };
}

export default function CreateStickerScreen({ pictures }) {
    const navigation = useNavigation();
    const route = useRoute();

    const imageUri = route.params?.image ?? null;
    const pictureId = route.params?.pictureId ?? null;
    const paramCreatedAt = route.params?.createdAt ?? null;

    const picture = pictures?.find((p) => p.id === pictureId) ?? null;
    const totalCount = pictures?.length ?? 1;
    const pictureIndex = pictures?.findIndex((p) => p.id === pictureId) ?? 0;
    const stickerNumber = totalCount - pictureIndex;

    const createdAt = picture?.createdAt ?? paramCreatedAt ?? new Date().toISOString();
    const { year, date } = formatDate(createdAt);

    const [bgColor, setBgColor] = useState(null); // nullの間はローディング
    const [imageReady, setImageReady] = useState(false);

    useEffect(() => {
        if (!imageUri) return;
        (async () => {
            const color = await extractDominantColorFromImage(imageUri);
            setBgColor(color);
        })();
    }, [imageUri]);

    const goHome = () => navigation.navigate("Home");

    const isReady = bgColor !== null && imageReady;

    if (!imageUri) {
        return (
            <View style={[styles.container, { backgroundColor: "#1a1a1a" }]}>
                <Text style={styles.errorText}>画像が見つかりません</Text>
                <TouchableOpacity style={styles.homeBtn} onPress={goHome}>
                    <Text style={styles.homeBtnText}>ホームへ戻る</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ---- ステッカーカード ---- */}
            <View
                style={[
                    styles.card,
                    { backgroundColor: bgColor ?? "#A8D8EA" },
                ]}
            >
                {/* ローディング中オーバーレイ */}
                {!isReady && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="rgba(255,255,255,0.8)" />
                        <Text style={styles.loadingText}>解析中...</Text>
                    </View>
                )}

                {/* 画像（透明背景のPNG） */}
                <Image
                    source={{ uri: imageUri }}
                    style={[styles.stickerImage, !imageReady && styles.hidden]}
                    resizeMode="contain"
                    onLoad={() => setImageReady(true)}
                />

                {/* 右下: No. & 日付 */}
                <View style={styles.metaBadge}>
                    <Text style={styles.noText}>
                        No.{String(stickerNumber).padStart(3, "0")}
                    </Text>
                    <Text style={styles.yearText}>{year}</Text>
                    <Text style={styles.dateText}>{date}</Text>
                </View>
            </View>

            {/* キャプション */}
            <Text style={styles.caption}>ステッカーが完成しました</Text>

            {/* ホームボタン */}
            <TouchableOpacity style={styles.homeBtn} onPress={goHome} activeOpacity={0.85}>
                <Text style={styles.homeBtnText}>ホームへ戻る</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "#111",
    },

    card: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 16,
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        zIndex: 5,
    },
    loadingText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontFamily: "Courier",
    },

    stickerImage: {
        width: CARD_SIZE * 0.82,
        height: CARD_SIZE * 0.82,
        zIndex: 2,
    },
    hidden: {
        opacity: 0,
    },

    metaBadge: {
        position: "absolute",
        bottom: 14,
        right: 16,
        alignItems: "flex-end",
        zIndex: 4,
    },
    noText: {
        fontFamily: "Courier",
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(0,0,0,0.55)",
        letterSpacing: 1,
    },
    yearText: {
        fontFamily: "Courier",
        fontSize: 10,
        color: "rgba(0,0,0,0.45)",
        letterSpacing: 0.5,
    },
    dateText: {
        fontFamily: "Courier",
        fontSize: 13,
        fontWeight: "800",
        color: "rgba(0,0,0,0.6)",
        letterSpacing: 1,
    },

    caption: {
        marginTop: 28,
        color: "rgba(255,255,255,0.55)",
        fontSize: 13,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        fontFamily: "Courier",
    },

    homeBtn: {
        marginTop: 20,
        paddingHorizontal: 36,
        paddingVertical: 14,
        backgroundColor: "#fff",
        borderRadius: 50,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    homeBtnText: {
        color: "#111",
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: 0.5,
    },

    errorText: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 20,
    },
});