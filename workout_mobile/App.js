import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from './components/screens/Login';
import Register from './components/screens/Register';
import Home from './components/screens/Home';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import NewExercise from './components/screens/NewExercise';
import Profile from './components/screens/Profile';
import AddUserInfo from './components/screens/AddUserInfo';
import ValidateEmail from './components/screens/ValidateEmail';
import FinishWorkout from './components/screens/FinishWorkout';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import WorkoutDetails from './components/screens/WorkoutDetails';

const theme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: '#fff'},
};

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="NewExercise"
        component={NewExercise}
        options={{
          tabBarLabel: 'New Workout',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="plus" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  {
    /*useEffect(() => {
    const getToken = async () => {
      try {
        const dataString = await AsyncStorage.getItem('data');
        const data = JSON.parse(dataString);
        console.log(data + 'this is data');
        if (data.id != -1) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.log('Error getting token:', error);
      }
    };

    getToken();
  }, []);*/
  }

  const setLoggedInState = useCallback(() => {
    setLoggedIn(true);
    //console.log('Logged in set to true');
  }, [setLoggedIn]);

  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      {loggedIn ? (
        <Tab.Navigator initialRouteName="Home">
          <Tab.Screen name="Home" component={Home}></Tab.Screen>
          <Tab.Screen name="NewExercise" component={NewExercise}></Tab.Screen>
          <Tab.Screen name="Profile" component={Profile}></Tab.Screen>
        </Tab.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <Stack.Screen
            name="Login"
            component={Login}
            setLoggedInState={setLoggedInState}></Stack.Screen>
          <Stack.Screen name="Register" component={Register}></Stack.Screen>
          <Stack.Screen name="HomeScreen" component={HomeTabs} />
          <Stack.Screen
            name="AddUserInfo"
            component={AddUserInfo}></Stack.Screen>
          <Stack.Screen
            name="ValidateEmail"
            component={ValidateEmail}></Stack.Screen>
          <Stack.Screen
            name="FinishWorkout"
            component={FinishWorkout}></Stack.Screen>
          <Stack.Screen
            name="WorkoutDetails"
            component={WorkoutDetails}
            options={{headerShown: true}}></Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
