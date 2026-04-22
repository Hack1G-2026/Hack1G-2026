import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Image } from 'expo-image';
import {
    Button,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
    State,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import BlackFrame from '../components/BlackFrame';
import { removeBackground } from '../utils/removeBg';

export default function CameraScreen() {
    const navigation = useNavigation();

    const [permission, requestPermission] = useCameraPermissions();
    const [camera, setCamera] = useState(null);
    const [facing, setFacing] = useState('back');

    const [zoom, setZoom] = useState(0);
    const [baseZoom, setBaseZoom] = useState(0);
    const [loading, setLoading] = useState(false);

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
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

            const photo = await camera.takePictureAsync();
            console.log("撮影成功", photo.uri);

            const resultUri = await removeBackground(photo.uri);
            console.log("API結果", resultUri);

            if (!resultUri) {
                console.log("resultUriがnull");
                setLoading(false);
                return;
            }

            setLoading(false);

            console.log("遷移する");
            navigation.navigate('Home', { image: resultUri });

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
                    <TouchableOpacity onPress={takePicture}>
                        <Image
                            source={require('../../assets/Frame 7.png')}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.camera_text}>
                        被写体を枠内に収めて撮影してください。{"\n"}
                        （※画面内に被写体以外のものは{"\n"}
                        入れないでください）
                    </Text>
                </View>

                <View style={styles.zoomContainer}>
                    <Text style={styles.text}>
                        Zoom: {(zoom * 100).toFixed(0)}%
                    </Text>
                </View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    captureContainer: {
        position: 'absolute',
        bottom: 150,
        alignSelf: 'center',
    },
    textContainer: {
        position: 'absolute',
        top: 150,
        alignSelf: 'center',
    },
    zoomContainer: {
        position: 'absolute',
        bottom: 250,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        padding: 8,
    },
    text: { color: 'white', fontSize: 18 },
    camera_text: {
        position: 'absolute',
        transform: [
            { translateX: -175 },
            { translateY: 0 },
        ],
        color: 'white',
        fontSize: 18,
    },
    image: { width: 80, height: 80 },
});