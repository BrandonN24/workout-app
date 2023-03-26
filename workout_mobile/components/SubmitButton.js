import {Pressable, StyleSheet, Text, View, Dimensions} from 'react-native';
import React from 'react';
import {useFormik, useFormikContext} from 'formik';

const SubmitButton = ({title}) => {
  const {handleSubmit, isSubmitting} = useFormikContext();
  return (
    <Pressable
      onPress={isSubmitting ? null : handleSubmit}
      style={[
        styles.submit,
        {backgroundColor: isSubmitting ? 'gray' : '#8469cf'},
      ]}>
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );
};

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  submit: {
    width: width - 40,
    height: 50,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20,
    color: '#fff',
  },
});
export default SubmitButton;
