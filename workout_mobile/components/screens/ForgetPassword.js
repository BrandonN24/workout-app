import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import client from '../../api/client';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForgetPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');

  const handleSubmit = async () => {
    try {
      let sendID = {
        email: email,
      };
      let jsIdObj = JSON.stringify(sendID);
      const parsedIdObj = JSON.parse(jsIdObj);
      const response = await client.post('/api/sendEmailTokenless', {
        ...parsedIdObj,
      });
      await AsyncStorage.setItem('checkEmail', email);
      await AsyncStorage.setItem('checkLogin', login);
      navigation.navigate('PasswordCode');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Email and Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={text => setEmail(text)}
        value={email}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Login"
        onChangeText={text => setLogin(text)}
        value={login}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    margin: 8,
    width: '80%',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ForgetPassword;
