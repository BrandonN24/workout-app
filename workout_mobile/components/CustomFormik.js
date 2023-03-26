import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Formik} from 'formik';

const CustomFormik = ({
  children,
  initialValues,
  validationSchema,
  onSubmit,
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}>
      {({}) => {
        //console.log(errors,values)
        return children;
      }}
    </Formik>
  );
};

export default CustomFormik;
