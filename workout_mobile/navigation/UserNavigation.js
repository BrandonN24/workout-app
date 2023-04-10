import {createStackNavigator} from '@react-navigation/stack';
import Home from '../components/screens/Home';
import NewExercise from '../components/screens/NewExercise';
import Profile from '../components/screens/Profile';
import Tabs from './Tabs';

const Stack = createStackNavigator();

function UserNavigation() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Home" component={Tabs} />
    </Stack.Navigator>
  );
}

export default UserNavigation;
