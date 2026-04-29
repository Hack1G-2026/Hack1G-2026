import { Text, View, StyleSheet, Dimensions, Image, Pressable, Animated, Easing } from 'react-native';
import { BlurView} from 'expo-blur';
import{ LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';

const { width, height } = Dimensions.get('window');
  const boxHeight = height * 0.632;
  const boxWidgh = '100%';
  const footerWidgh = width * 0.838;
  const footerHeight = height * 0.0709;
  const footerBackgroundColor = '#181719';
  const footerBorderColor = '#414142';
  const buttonBackGroundColor = 'white';
  const footerBottom = height * 0.0458;
  const titleText2Bottom = height * 0.161;
  const boxTop = height * 0.144;
  const titleTextTop = height * 0.0915;
  const LeftIconButton = ({ onPress }) => {
  return (
    <View style={styles.group}>
      <Pressable
        style={[styles.button, styles.iconButton]}
        onPress={onPress}
      >
        <Image
          source={require('../../assets/icon_togi.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Pressable>

      <Text style={styles.groupText}>
        とぎ
      </Text>
    </View>
  );
};


export default function HomeScreen({ route }) {
  const message1 = '自分だけの好きを研ぎ澄ませ';
  const [selected, setSelected] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(10)).current;
  const handlePress = (index) => {
    setSelected(index);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 25,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 10,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  return (
    <View style={styles.container}>

      <Image
  source={require('../../assets/home_bg.png')}
  style={styles.box}
  resizeMode="cover"
/>

<Text style={styles.titleText}>
    YouLike...
  </Text>

  <Text style = {styles.titleText2}>
    あなただけの好きを研ぎ澄ませ
  </Text>

      <Animated.View style={[styles.footerWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
  colors={['rgba(59,59,59,1)', 'rgba(34,34,35,1)', 'rgba(18,18,19,1)']}
  style={styles.footer}
>
  {[0, 1, 2].map((index) => (
  <Animated.View
    key={index}
    style={selected === index && {
      shadowColor: 'green',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: shadowAnim,
    }}
  >
    {index === 0 ? (
      <LeftIconButton onPress={() => handlePress(index)} />
    ) : (
      <Pressable
        style={styles.button}
        onPress={() => handlePress(index)}
      />
    )}
  </Animated.View>
))}
</LinearGradient>
      </Animated.View>
      
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
    position: 'absolute',
    width: boxWidgh,
    height: boxHeight,
    borderRadius: 24,
    overflow: 'hidden',
    top: boxTop,
    justifyContent: 'flex-end',
  },
  footer: {
    width: footerWidgh,
    height: footerHeight,
    backgroundColor: footerBackgroundColor,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alighItems: 'center',
    borderRadius: 1000,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: footerBorderColor,

  },
  button: {
    backgroundColor: buttonBackGroundColor,
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 0,
  },
  buttonSelected: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#22aba0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  footerWrapper: {
    position: 'absolute',
    alighItems: 'center',
    bottom: footerBottom,
  },
  titleText: {
  position: 'absolute', 
  textAlign: 'center',
  top: titleTextTop,
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},
titleText2: {
  position: 'absolute', 
  textAlign: 'center',
  bottom: titleText2Bottom,
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},
iconButton: {
  backgroundColor: 'transparent',
  justifyContent: 'center',
  alignItems: 'center',
},

icon: {
  width: 28,
  height: 28,
},
leftUp: {
  transform: [{ translateY: -8 }], 
},
group: {
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 0,
},

groupText: {
  color: 'white',
  fontSize: 10,
  marginTop: 0,
},
});

