import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import FormContainer from '../FormContainer';
import AppInput from '../AppInput';
import SubmitButton from '../SubmitButton';
import {useNavigation} from '@react-navigation/native';
import CustomFormik from '../CustomFormik';
import * as yup from 'yup';
import NavigateButton from '../NavigateButton';

const Login = () => {
  const initialValues = {
    userName: '',
    password: '',
  };

  const validationSchema = yup.object({
    userName: yup.string().trim().required('Username is missing!'),
    password: yup
      .string()
      .trim()
      .min(5, 'Password is too short!')
      .required('Password is missing!'),
  });

  const handleLogin = (values, formikActions) => {
    setTimeout(() => {
      console.log(values, formikActions);
      formikActions.resetForm();
      formikActions.setSubmitting(false);
    }, 3000);
  };

  const navigation = useNavigation();
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <FormContainer>
      <CustomFormik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}>
        <AppInput name="userName" placeholder="Username" />
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
