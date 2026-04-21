import { StatusBar } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const CameraScreen = () => {
    return (
        <View style={styles.container}>
            <Text>カメラ画面</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});