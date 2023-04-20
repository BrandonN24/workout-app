import React from 'react';
import {View, Text, Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = ({}) => {
  const navigation = useNavigation();
  const handleSignOut = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Welcome to your profile!</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

export default ProfileScreen;
