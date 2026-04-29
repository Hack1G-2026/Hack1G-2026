/**
 * CreateLikeResultScreen.js
 *
 * ・AIが生成した「好きの逆」結果を表示
 * ・Homeへ戻るボタンでHome画像を全削除してリセット
 */

import { useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

function OppositeLikeCard({ item, index }) {
    const slideAnim = useRef(new Animated.Value(60)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
            ]}
        >
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
        </Animated.View>
    );
}

export default function CreateLikeResultScreen({ clearPictures }) {
    const navigation = useNavigation();
    const route = useRoute();
    const result = route.params?.result ?? null;

    const titleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(titleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const goHome = () => {
        // Home画像を全削除
        clearPictures?.();
        // ナビゲーションスタックをリセットしてHomeへ
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    };

    if (!result) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>結果データが見つかりません</Text>
                <TouchableOpacity style={styles.homeBtn} onPress={goHome}>
                    <Text style={styles.homeBtnText}>ホームへ戻る</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ヘッダー */}
                <Animated.View style={[styles.headerBlock, { opacity: titleAnim }]}>
                    <Text style={styles.eyebrow}>あなたの新しい好き</Text>
                    <Text style={styles.mainTitle}>逆側の世界へ</Text>
                    <Text style={styles.subtitle}>{result.summary}</Text>
                </Animated.View>

                {/* 検出された好き */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>検出された好き</Text>
                    <View style={styles.tagRow}>
                        {(result.detected_likes ?? []).map((like, i) => (
                            <View key={i} style={styles.tag}>
                                <Text style={styles.tagText}>{like}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 区切り */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>↕</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* 逆の好き一覧 */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>逆側の好き</Text>
                    {(result.opposite_likes ?? []).map((item, i) => (
                        <OppositeLikeCard key={i} item={item} index={i} />
                    ))}
                </View>

                {/* ホームボタン */}
                <TouchableOpacity style={styles.homeBtn} onPress={goHome} activeOpacity={0.85}>
                    <Text style={styles.homeBtnText}>ホームへ戻る</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    scroll: {
        paddingTop: 60,
        paddingHorizontal: 24,
    },

    /* ヘッダー */
    headerBlock: {
        marginBottom: 32,
    },
    eyebrow: {
        color: "#00DAEB",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 8,
    },
    mainTitle: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "900",
        letterSpacing: -1,
        marginBottom: 12,
    },
    subtitle: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 14,
        lineHeight: 22,
    },

    /* セクション */
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 12,
    },

    /* タグ */
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        backgroundColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    tagText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
    },

    /* 区切り */
    divider: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginVertical: 8,
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    dividerText: {
        color: "rgba(255,255,255,0.2)",
        fontSize: 16,
    },

    /* カード */
    card: {
        flexDirection: "row",
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        gap: 14,
        borderWidth: 1,
        borderColor: "rgba(0,218,235,0.1)",
    },
    cardEmoji: {
        fontSize: 32,
        lineHeight: 40,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    cardDesc: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        lineHeight: 20,
    },

    /* ホームボタン */
    homeBtn: {
        marginTop: 16,
        paddingVertical: 18,
        backgroundColor: "#00DAEB",
        borderRadius: 50,
        alignItems: "center",
        shadowColor: "#00DAEB",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 10,
    },
    homeBtnText: {
        color: "#111",
        fontSize: 17,
        fontWeight: "900",
        letterSpacing: 0.5,
    },

    errorText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
        marginTop: 100,
        marginBottom: 24,
    },
});