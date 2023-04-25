import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import FormContainer from '../FormContainer';
import AppInput from '../AppInput';
import SubmitButton from '../SubmitButton';
import {useNavigation} from '@react-navigation/native';
import CustomFormik from '../CustomFormik';
import * as yup from 'yup';
import NavigateButton from '../NavigateButton';
import client from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import {parse} from 'dotenv';

const Login = ({setLoggedInState}) => {
  const initialValues = {
    login: '',
    password: '',
  };

  const navigation = useNavigation();
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };
  const navigateToHome = () => {
    navigation.navigate('HomeScreen');
  };
  const validationSchema = yup.object({
    login: yup.string().trim().required('Username is missing!'),
    password: yup
      .string()
      .trim()
      .min(5, 'Password is too short!')
      .required('Password is missing!'),
  });

  const handleLogin = async (values, formikActions) => {
    try {
      const {data: res} = await client.post('/api/login', {...values});

      let storage = require('../../tokenStorage');
      storage.storeToken(res);
      await AsyncStorage.setItem('token', res.accessToken);
      const decodedToken = jwt_decode(res.accessToken);
      console.log(decodedToken);
      if (decodedToken.id != -1) {
        //setLoggedIn(true);
        //setLoggedInState();
        //console.log('Stored token: ' + storage.retrieveToken);
        var token = await AsyncStorage.getItem('token');
        let sendID = {id: decodedToken.id, jwtToken: token};
        let jsIdObj = JSON.stringify(sendID);
        //console.log(jsIdObj);
        const parsedIdObj = JSON.parse(jsIdObj);
        const infoRequest = await client.post('/api/getUserInfo', {
          ...parsedIdObj,
        });
        console.log(infoRequest.data);
        await AsyncStorage.setItem('data', JSON.stringify(infoRequest.data));
        //await AsyncStorage.removeItem('token');
        console.log(infoRequest.data.jwtToken.accessToken);
        await AsyncStorage.setItem(
          'token',
          infoRequest.data.jwtToken.accessToken,
        );
        console.log('Logged in set to true');

        if (infoRequest.data.validated == false) {
          var token = await AsyncStorage.getItem('token');
          let sendID = {email: infoRequest.data.email, jwtToken: token};
          let jsIdObj = JSON.stringify(sendID);
          const parsedIdObj = JSON.parse(jsIdObj);
          const sendEmail = await client.post('/api/sendEmail', {
            ...parsedIdObj,
          });
          console.log(sendEmail);
          navigation.navigate('ValidateEmail');
        } else if (
          infoRequest.data.height == -1 &&
          infoRequest.data.age == -1 &&
          infoRequest.data.weight == -1
        ) {
          navigation.navigate('AddUserInfo');
        } else {
          navigation.navigate('HomeScreen');
        }
      }
      formikActions.resetForm();
      formikActions.setSubmitting(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <FormContainer>
      <CustomFormik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}>
        <Text style={styles.title}>UCF Fitness</Text>
        <AppInput name="login" placeholder="Username" />
        <AppInput secureTextEntry name="password" placeholder="Password" />
        <SubmitButton title="Log In" />
        <NavigateButton onPress={navigateToRegister} title="Register" />
      </CustomFormik>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    color: '#353535',
  },
});

export default Login;
