import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FormContainer from '../FormContainer'
import AppInput from '../AppInput'
import SubmitButton from '../SubmitButton'
import { useNavigation } from '@react-navigation/native'

const Login = () => {
  const navigation = useNavigation()
  const navigateToRegister = () =>{
    navigation.navigate('Register')
  }

  return (
    <FormContainer>
        <AppInput placeholder="Username"/>
        <AppInput placeholder='Password'/>
        <SubmitButton title="Log In" />
        <SubmitButton onPress={navigateToRegister} title="Register" />
    </FormContainer>
  )
}

const styles = StyleSheet.create({
    container: {}
})

export default Login

