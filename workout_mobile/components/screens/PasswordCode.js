import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import client from '../../api/client';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PasswordCode = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const handleSubmit = async () => {
    try {
      const email = await AsyncStorage.getItem('checkEmail');
      let sendID = {
        email: email,
        vCode: code,
      };

      let jsIdObj = JSON.stringify(sendID);
      const parsedIdObj = JSON.parse(jsIdObj);
      const response = await client.post('/api/verifyPasswordChange', {
        ...parsedIdObj,
      });
      if (response.data.newPass === true) {
        navigation.navigate('ChangePassword');
      } else {
        setError('Invalid code');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Code</Text>
      <TextInput
        style={styles.input}
        onChangeText={setCode}
        value={code}
        placeholder="Enter code"
      />
      {error !== '' && <Text style={styles.error}>{error}</Text>}
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
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    width: '80%',
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default PasswordCode;
