import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = ({}) => {
  const navigation = useNavigation();
  const handleSignOut = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your profile!</Text>
      <View style={styles.buttonContainer}>
        <Button title="Sign Out" onPress={handleSignOut} color="#3C6E71" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
  },
  button: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
    color: '#3C6E71',
  },
  buttonContainer: {
    position: 'absolute', // Added to position the container absolutely
    bottom: 0, // Positioned at the bottom of the screen
    left: 0, // Positioned at the left of the screen
    right: 0, // Positioned at the right of the screen
    alignItems: 'center',
    paddingTop: 50, // Added padding to push the Text component up
    paddingBottom: 50, // Added padding to push the Button component up
  },
});

export default ProfileScreen;
