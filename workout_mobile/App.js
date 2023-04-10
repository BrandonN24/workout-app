import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import AuthNavigation from './navigation/AuthNavigation';
import {createStackNavigator} from '@react-navigation/stack';
import Login from './components/screens/Login';
import Register from './components/screens/Register';
import Home from './components/screens/Home';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import NewExercise from './components/screens/NewExercise';
import Profile from './components/screens/Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Settings} from 'react-native/types';
import AddUserInfo from './components/screens/AddUserInfo';
import ValidateEmail from './components/screens/ValidateEmail';

const theme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: '#fff'},
};

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="NewExercise" component={NewExercise} />
      <Tab.Screen name="Profile" component={Profile} />
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
    console.log('Logged in set to true');
  }, [setLoggedIn]);

  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();

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
          <Stack.Screen name="HomeScreen" component={HomeTabs}></Stack.Screen>
          <Stack.Screen
            name="AddUserInfo"
            component={AddUserInfo}></Stack.Screen>
          <Stack.Screen
            name="ValidateEmail"
            component={ValidateEmail}></Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
