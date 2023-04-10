import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

const ValidateEmail = ({email}) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerificationCodeChange = code => {
    setVerificationCode(code);
  };

  const handleVerifyEmail = () => {
    axios
      .post('/verify-email', {email, verificationCode})
      .then(response => {
        // Do something on success, e.g. navigate to home screen
      })
      .catch(error => {
        console.error(error);
        // Display an error message to the user
      });
  };

  return (
    <View>
      <Text>Verify Your Email Address</Text>
      <Text>
        A verification code has been sent to {email}. Please enter the code
        below to verify your email address.
      </Text>
      <TextInput
        placeholder="Verification Code"
        value={verificationCode}
        onChangeText={handleVerificationCodeChange}
      />
      <TouchableOpacity onPress={handleVerifyEmail}>
        <Text>Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ValidateEmail;

const styles = StyleSheet.create({});
