import { Dimensions, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

const AppInput = ({value, placeholder, onChange, ...rest}) => {
  return (
    <TextInput
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={styles.input}
        {...rest}>
    </TextInput>
  )
}

const {width} = Dimensions.get('window')
const styles = StyleSheet.create({
    input: {
        width: width -40,
        height: 50,
        backgroundColor: '#eae9e7',
        fontSize:20,
        paddingHorizontal: 15,
        borderRadius: 8,
        color: '#8469cf',
        marginBottom: 20,
      },
})
export default AppInput
