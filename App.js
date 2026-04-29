import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CameraScreen from './src/screens/CameraScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions = {{ headerShown: false}}>
  <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Camera" component={CameraScreen} />
                                      


      </Stack.Navigator>
    </NavigationContainer>
  );
}