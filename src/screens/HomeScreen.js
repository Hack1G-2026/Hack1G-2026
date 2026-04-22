import { View, Image } from 'react-native';

export default function HomeScreen({ route }) {
  const image = route?.params?.image;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 300, height: 300 }}
        />
      )}
    </View>
  );
}