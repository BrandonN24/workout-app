import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react'
import Login from './components/screens/Login';
import Register from './components/screens/Register';
import AuthNavigation from './navigation/AuthNavigation';

const theme = {...DefaultTheme, colors: {...DefaultTheme.colors, background:'#fff'}}

const App = () => {
  return( 
    <NavigationContainer theme={theme}>
      <AuthNavigation/>
    </NavigationContainer>
  );
};

export default App;