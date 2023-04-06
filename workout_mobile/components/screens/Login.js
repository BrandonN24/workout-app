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

const Login = () => {
  const initialValues = {
    login: '',
    password: '',
  };

  const navigation = useNavigation();
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };
  const navigateToHome = () => {
    navigation.navigate('Home');
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
      console.log(data);
      if (data.id != -1) {
        navigateToHome();
      }
      formikActions.resetForm();
      formikActions.setSubmitting(false);
    } catch (error) {
      console.log(error?.response?.data);
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
