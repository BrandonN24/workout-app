import { Pressable, StyleSheet, Text, View , Dimensions} from 'react-native'
import React from 'react'

const SubmitButton = ({title, onPress}) => {
  return (
    <Pressable onPress={onPress} style={styles.submit}>
        <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  )
}

const {width, height} = Dimensions.get('window')
const styles = StyleSheet.create({
    submit: {
        width: width -40,
        height: 50,
        backgroundColor: '#8469cf',
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
      },
      btnText: {
        fontSize:20,
        color: '#fff',
      }
})
export default SubmitButton
