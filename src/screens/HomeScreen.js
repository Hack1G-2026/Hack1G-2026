import { Text, View, StyleSheet, Dimensions, Image, Pressable} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ route }) {
  const message1 = '自分だけの好きを研ぎ澄ませ';
  const image = route?.params?.image;

  return (
    <View style={styles.container}>
      <View style={styles.box} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 300, height: 300, position: 'absolute' }}
        />
      )}
      <Text style={styles.mes}>{message1}</Text>
      <Pressable style = {({pressed}) => [
        styles.button1,
        { opacity: pressed ? 0.5 : 1}
      ]} />
      <Pressable style = {({pressed}) => [
        styles.button2,
        { opacity: pressed ? 0.5 : 1}
      ]} />
      <Pressable style = {({pressed}) => [
        styles.button3,
        { opacity: pressed ? 0.5 : 1}
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  box: {
    width: '100%',
    height: '70%',
    backgroundColor: '#00DAEB',
    borderRadius: 24,
    marginTop: -height * 0.05,
  },
  mes: {
    color: 'white',
    fontSize: 18,
    marginTop: 50,
  },
  button1: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  button2: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    right: 100,
  },
  button3: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    left: 100,
  },
  
});