import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Home from '../components/screens/Home';
import Profile from '../components/screens/Profile';
import NewExercise from '../components/screens/NewExercise';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home}></Tab.Screen>
      <Tab.Screen name="NewExercise" component={NewExercise}></Tab.Screen>
      <Tab.Screen name="Profile" component={Profile}></Tab.Screen>
    </Tab.Navigator>
  );
};

export default Tabs;
