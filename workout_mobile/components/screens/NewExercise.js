import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NewExercise = () => {
  const [exercises, setExercises] = useState(['']);
  const [editing, setEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState('');

  const handleAddExercise = () => {
    if (exercises[exercises.length - 1] !== '') {
      setExercises([...exercises, '']);
    }
  };
  const navigation = useNavigation();
  const handleStartWorkout = () => {
    // Send the exercises to the API endpoint using Express and MongoDB here
    const nonEmptyExercises = exercises.filter(exercise => exercise !== '');
    console.log('Exercises:', nonEmptyExercises);
    AsyncStorage.setItem('exerciseNames', JSON.stringify(nonEmptyExercises));
    navigation.navigate('FinishWorkout');
  };

  const handleExerciseChange = (text, index) => {
    const newExercises = [...exercises];
    newExercises[index] = text;
    setExercises(newExercises);
  };

  const handleEdit = () => {
    setEditing(!editing);
  };

  const handleDelete = index => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleWorkoutNameChange = text => {
    setWorkoutName(text);
  };

  const handleSaveWorkoutName = async () => {
    try {
      await AsyncStorage.setItem('workoutName', workoutName);
    } catch (error) {
      console.log('Error saving workout name:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Make A New Workout</Text>
        <TextInput
          style={styles.headerInput}
          placeholder="Workout name"
          value={workoutName}
          onChangeText={handleWorkoutNameChange}
          onBlur={handleSaveWorkoutName}
        />
      </View>
      <View style={styles.table}>
        {exercises.map((exercise, index) => (
          <View style={styles.row} key={index}>
            {editing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(index)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.input}
              placeholder="Exercise name"
              value={exercise}
              onChangeText={text => handleExerciseChange(text, index)}
            />
          </View>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddExercise}>
          <Text style={styles.buttonText}>New Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleStartWorkout}>
          <Text style={styles.buttonText}>Start workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleEdit}>
          <Text style={styles.buttonText}>{editing ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  table: {
    flexDirection: 'column',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
    borderRadius: 9,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  borderedInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  button: {
    backgroundColor: '#3C6E71',
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
  deleteButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default NewExercise;
