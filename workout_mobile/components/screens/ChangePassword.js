import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import client from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      const login = await AsyncStorage.getItem('checkLogin');
      let sendID = {
        login: login,
        password: password,
      };
      let jsIdObj = JSON.stringify(sendID);
      const parsedIdObj = JSON.parse(jsIdObj);
      const response = await client.post('/api/changePassword', {
        ...parsedIdObj,
      });
      navigation.navigate('Login');
    } catch (error) {
      console.log(error);
      // Handle errors, e.g. show an error message
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={value => setPassword(value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={value => setConfirmPassword(value)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    color: '#353535',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 10,
    margin: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    margin: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChangePassword;
