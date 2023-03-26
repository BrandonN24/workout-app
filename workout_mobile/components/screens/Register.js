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
import axios from 'axios';
import client from '../../api/client';

const initialValues = {
  login: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const validationSchema = yup.object({
  login: yup.string().trim().required('Username is missing!'),
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

  const handleRegister = async (values, formikActions) => {
    try {
      const {data} = await client.post('/api/register', {...values});
      console.log(data);
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
        onSubmit={handleRegister}>
        <AppInput name="login" placeholder="Username" />
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
