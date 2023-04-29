import React, {useEffect, useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const data = await AsyncStorage.getItem('data');
        const parsedData = JSON.parse(data);
        setName(decodedToken.name);
        setEmail(parsedData.email);
        setAge(parsedData.age);
        setHeight(parsedData.height);
        setWeight(parsedData.weight);
      } catch (error) {
        console.log(error);
      }
    };
    getToken();
  }, []);

  const handleSignOut = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your profile, {name}!</Text>
      <Text style={styles.subtitle}>Email: {email}</Text>
      <Text style={styles.subtitle}>Age: {age}</Text>
      <Text style={styles.subtitle}>Height: {height} ft</Text>
      <Text style={styles.subtitle}>Weight: {weight} lb</Text>
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
  subtitle: {
    fontSize: 18,
    marginTop: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 50,
  },
});

export default ProfileScreen;
