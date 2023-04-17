import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const NewExercise = () => {
  const [exercises, setExercises] = useState(['']);

  const handleAddExercise = () => {
    if (exercises[exercises.length - 1] !== '') {
      setExercises([...exercises, '']);
    }
  };

  const handleStartWorkout = () => {
    // Send the exercises to the API endpoint using Express and MongoDB here
    console.log('Exercises:', exercises);
  };

  const handleExerciseChange = (text, index) => {
    const newExercises = [...exercises];
    newExercises[index] = text;
    setExercises(newExercises);
  };

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        {exercises.map((exercise, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder="Exercise name"
            value={exercise}
            onChangeText={text => handleExerciseChange(text, index)}
          />
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddExercise}>
          <Text style={styles.buttonText}>Add new exercise name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleStartWorkout}>
          <Text style={styles.buttonText}>Start workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  table: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NewExercise;
