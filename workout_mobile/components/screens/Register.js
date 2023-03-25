import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FormContainer from '../FormContainer'
import AppInput from '../AppInput'
import SubmitButton from '../SubmitButton'
import { useNavigation } from '@react-navigation/native'

const Register = () => {
    const navigation = useNavigation()
    const navigateToRegister = () => {
        navigation.navigate('Login')
    }
  return (
    <FormContainer>
        <AppInput placeholder="Username"/>
        <AppInput placeholder='Name'/>
        <AppInput placeholder="Email"/>
        <AppInput placeholder='Password'/>
        <AppInput placeholder="Confirm Password"/>
        <SubmitButton title="Register" />
        <SubmitButton onPress={navigateToRegister} title="Back To Login" />
    </FormContainer>
  )
}

export default Register

const styles = StyleSheet.create({})