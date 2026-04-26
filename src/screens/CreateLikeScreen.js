import { useEffect, useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";

// 1. Google公式ライブラリをインポート
import { GoogleGenerativeAI } from "@google/generative-ai";

const { width, height } = Dimensions.get("window");
const THUMB_SIZE = 90;
const CENTER_X = width / 2 - THUMB_SIZE / 2;
const CENTER_Y = height / 2 - THUMB_SIZE / 2;

// APIキーの設定
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// 2. SDKの初期化
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function analyzeImagesWithGemini(pictures) {
    if (!pictures || pictures.length === 0) throw new Error("画像がありません");

    // SDKを使用する場合、モデル名を指定するだけで適切なURLに接続されます
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // 画像の加工とBase64変換
    const imageParts = await Promise.all(
        pictures.slice(0, 3).map(async (pic) => {
            const resized = await ImageManipulator.manipulateAsync(
                pic.uri,
                [{ resize: { width: 512 } }],
                { format: ImageManipulator.SaveFormat.JPEG, base64: true, compress: 0.5 }
            );
            return {
                inlineData: {
                    data: resized.base64,
                    mimeType: "image/jpeg",
                },
            };
        })
    );

    const prompt = `画像から読み取れる好みを分析し、「その逆の好き」を提案してください。
必ず以下のJSON形式のみで回答してください。
{
  "detected_likes": ["好き1"],
  "opposite_likes": [{"title": "タイトル", "description": "説明", "emoji": "🌵"}],
  "summary": "まとめ"
}`;

    // 3. SDK経由でコンテンツ生成（URLを手書きしないのでエラーが起きにくい）
    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        // JSON部分のみを抽出してパース
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("SDK Error Details:", error);
        throw new Error(`【分析エラー】${error.message}`);
    }
}

export default function CreateLikeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const pictures = route.params?.pictures ?? [];

    const [analysisResult, setAnalysisResult] = useState(null);
    const [apiLoading, setApiLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [merged, setMerged] = useState(false);

    const animsRef = useRef(pictures.map((_, i) => ({
        x: new Animated.Value((i % 3) * (THUMB_SIZE + 12) + 20),
        y: new Animated.Value(80 + Math.floor(i / 3) * (THUMB_SIZE + 12)),
    })));

    useEffect(() => {
        analyzeImagesWithGemini(pictures)
            .then(setAnalysisResult)
            .catch(e => {
                setApiError(e.message);
                Alert.alert("エラーが発生しました", e.message);
            })
            .finally(() => setApiLoading(false));
    }, []);

    const triggerMerge = useCallback(() => {
        const animations = animsRef.current.flatMap((anim) => [
            Animated.spring(anim.x, { toValue: CENTER_X, useNativeDriver: true }),
            Animated.spring(anim.y, { toValue: CENTER_Y, useNativeDriver: true }),
        ]);
        Animated.parallel(animations).start(() => setMerged(true));
    }, []);

    useEffect(() => {
        const sub = Accelerometer.addListener(({ x, y }) => {
            if (Math.abs(x) + Math.abs(y) > 2.5) triggerMerge();
        });
        return () => sub.remove();
    }, [triggerMerge]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>分析ステータス</Text>
                <Text style={styles.headerSub}>
                    {apiLoading ? "⚡ AIが解析中..." : apiError ? "❌ エラー" : merged ? "✅ 準備完了" : "📱 スマホを振って合体！"}
                </Text>
            </View>

            <View style={styles.field}>
                {!merged && pictures.map((pic, i) => (
                    <Animated.Image
                        key={pic.id || i}
                        source={{ uri: pic.uri }}
                        style={[styles.thumb, { transform: [{ translateX: animsRef.current[i].x }, { translateY: animsRef.current[i].y }] }]}
                    />
                ))}
                {merged && !apiError && <Text style={styles.mergedLabel}>✦ 分析完了 ✦</Text>}
                {apiError && <Text style={styles.apiErrorText}>{apiError}</Text>}
            </View>

            {merged && !apiLoading && !apiError && (
                <TouchableOpacity
                    style={styles.resultBtn}
                    onPress={() => navigation.navigate("CreateLikeResult", { result: analysisResult })}
                >
                    <Text style={styles.resultBtnText}>結果を見る →</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0a0a0a" },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
    headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
    headerSub: { color: "#00DAEB", fontSize: 14, marginTop: 4 },
    field: { flex: 1, backgroundColor: "#141414", borderRadius: 24, margin: 16, justifyContent: "center", alignItems: "center" },
    thumb: { position: "absolute", width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 16 },
    mergedLabel: { color: "#00DAEB", fontSize: 20, fontWeight: "bold" },
    apiErrorText: { color: "#ff6b6b", textAlign: "center", padding: 20, fontSize: 12 },
    resultBtn: { margin: 24, paddingVertical: 18, backgroundColor: "#00DAEB", borderRadius: 50, alignItems: "center" },
    resultBtnText: { color: "#111", fontSize: 17, fontWeight: "900" },
});