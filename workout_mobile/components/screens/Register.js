import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import FormContainer from '../FormContainer';
import AppInput from '../AppInput';
import SubmitButton from '../SubmitButton';
import {useNavigation} from '@react-navigation/native';

import {Formik} from 'formik';
import * as yup from 'yup';
import CustomFormik from '../CustomFormik';
import NavigateButton from '../NavigateButton';

const initialValues = {
  userName: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const validationSchema = yup.object({
  userName: yup.string().trim().required('Username is missing!'),
  name: yup.string().trim().required('Name is missing!'),
  email: yup.string().email('Invalid email!').required('Email is missing!'),
  password: yup
    .string()
    .trim()
    .min(5, 'Password is too short!')
    .required('Password is missing!'),
});

const Register = () => {
  const navigation = useNavigation();
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = (values, formikActions) => {
    setTimeout(() => {
      console.log(values, formikActions);
      formikActions.resetForm();
      formikActions.setSubmitting(false);
    }, 3000);
  };
  return (
    <FormContainer>
      <CustomFormik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleRegister}>
        <AppInput name="userName" placeholder="Username" />
        <AppInput name="name" placeholder="Name" />
        <AppInput name="email" placeholder="Email" />
        <AppInput secureTextEntry name="password" placeholder="Password" />
        <AppInput
          secureTextEntry
          name="confirmPassword"
          placeholder="Confirm Password"
        />
        <SubmitButton title="Register" />
        <NavigateButton onPress={navigateToLogin} title="Back To Login" />
      </CustomFormik>
    </FormContainer>
  );
};

export default Register;

const styles = StyleSheet.create({});
