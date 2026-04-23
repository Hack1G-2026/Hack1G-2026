import * as FileSystem from 'expo-file-system/legacy';

export async function removeBackground(imageUri) {
    try {
        const formData = new FormData();

        formData.append('image_file', {
            uri: imageUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': 'xV7GbAgxtzsz5KdbUDhx6iQk',
            },
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('APIエラー:', text);
            return null;
        }

        // ⭐ blobで受け取る
        const blob = await response.blob();

        // ⭐ base64に変換
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        return new Promise((resolve) => {
            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];

                const fileUri = FileSystem.cacheDirectory + 'removed.png';

                await FileSystem.writeAsStringAsync(fileUri, base64data, {
                    encoding: 'base64',
                });

                resolve(fileUri);
            };
        });

    } catch (e) {
        console.error("removeBackgroundエラー:", e);
        return null;
    }
}