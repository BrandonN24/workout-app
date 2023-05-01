import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AppInput from '../AppInput';
import FormContainer from '../FormContainer';
import CustomFormik from '../CustomFormik';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubmitButton from '../SubmitButton';
import client from '../../api/client';
import jwt_decode from 'jwt-decode';
import {useNavigation} from '@react-navigation/native';

const AddUserInfo = () => {
  const [loginData, setLoginData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const navigation = useNavigation();
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
      let token = await AsyncStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      let data = await AsyncStorage.getItem('data');
      data = JSON.parse(data);
      //console.log(decodedToken);
      let sendID = {
        login: decodedToken.login,
        ...values,
        jwtToken: token,
      };
      //console.log(sendID);
      const {addInfo} = await client.post('/api/addUserInfo', {
        ...sendID,
      });
      //console.log(addInfo);
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
