import { KeyboardAvoidingView, ScrollView, StyleSheet, Dimensions, Text, View } from 'react-native'

const FormContainer = ({children}) => {
  return (
    <KeyboardAvoidingView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
            {children}
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

const {width, height} = Dimensions.get('window')
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: height * .2,
      }
})
export default FormContainer
