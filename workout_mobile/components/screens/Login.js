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
      const {data} = await client.post('/api/login', {...values});
      console.log(data.id);
      if (data.id != -1) {
        console.log(data);
        //setLoggedIn(true);
        //setLoggedInState();
        await AsyncStorage.setItem('data', JSON.stringify(data));
        console.log('Logged in set to true');
        if (data.validated == false) {
          navigation.navigate('ValidateEmail');
        }
        if (data.height == null && data.age == null && data.weight == null) {
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
});

export default Login;
