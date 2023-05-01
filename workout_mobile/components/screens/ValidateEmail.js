import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';
import {useNavigation} from '@react-navigation/native';

const ValidateEmail = ({email}) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerificationCodeChange = code => {
    setVerificationCode(code);
  };
  const navigation = useNavigation();
  const handleVerifyEmail = async () => {
    let token = await AsyncStorage.getItem('token');
    let data = await AsyncStorage.getItem('data');
    data = JSON.parse(data);
    //console.log(data.email);
    let email = data.email;
    let sendID = {
      email: email,
      verificationCode: verificationCode,
      jwtToken: token,
    };
    //console.log(sendID);
    let jsIdObj = JSON.stringify(sendID);
    const parsedIdObj = JSON.parse(jsIdObj);
    const sendEmail = await client.post('/api/verifyEmail', {
      ...parsedIdObj,
    });
    //console.log(sendEmail.data);
    await AsyncStorage.setItem(
      'token',
      sendEmail.data.refreshedToken.accessToken,
    );

    if (data.height == null && data.age == null && data.weight == null) {
      navigation.navigate('AddUserInfo');
    } else {
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email Address</Text>
      <Text style={styles.description}>
        A verification code has been sent to {email}. Please enter the code
        below to verify your email address.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={verificationCode}
        onChangeText={handleVerificationCodeChange}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyEmail}>
        <Text style={styles.buttonText} onPress={handleVerifyEmail}>
          Verify
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ValidateEmail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '80%',
  },
  button: {
    backgroundColor: '#3C6E71',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
