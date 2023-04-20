import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AppInput from '../AppInput';
import FormContainer from '../FormContainer';
import CustomFormik from '../CustomFormik';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubmitButton from '../SubmitButton';
import client from '../../api/client';

const AddUserInfo = () => {
  const [loginData, setLoginData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const dataString = await AsyncStorage.getItem('data');
        const data = JSON.parse(dataString);
        setLoginData(data);
        //console.log(loginData.login);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const initialValues = {
    age: '',
    weight: '',
    height: '',
  };

  const validationSchema = yup.object({
    age: yup.string().trim().required('Username is missing!'),
    weight: yup.string().trim().required('Username is missing!'),
    height: yup.string().trim().required('Username is missing!'),
  });

  const handleUserInfo = async (values, formikActions) => {
    try {
      //console.log(loginData.login);
      const {data} = await client.post('/api/addUserInfo', {
        login: loginData.login,
        ...values,
      });
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <FormContainer>
      <CustomFormik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleUserInfo}>
        <AppInput name="weight" placeholder="weight" />
        <AppInput name="age" placeholder="age" />
        <AppInput name="height" placeholder="height" />
        <SubmitButton title="Enter User Info"></SubmitButton>
      </CustomFormik>
    </FormContainer>
  );
};

export default AddUserInfo;

const styles = StyleSheet.create({});
