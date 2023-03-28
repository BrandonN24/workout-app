import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import AuthNavigation from './navigation/AuthNavigation';

const theme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: '#fff'},
};

const App = () => {
  return (
    <NavigationContainer theme={theme}>
      <AuthNavigation />
    </NavigationContainer>
  );
};

export default App;
