import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const FinishWorkout = () => {
  const [exerciseNames, setExerciseNames] = useState([]);

  const navigation = useNavigation();
  useEffect(() => {
    getExerciseNames();
  }, []);

  const getExerciseNames = async () => {
    try {
      const names = await AsyncStorage.getItem('exerciseNames');
      if (names !== null) {
        setExerciseNames(JSON.parse(names));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [sets, setSets] = useState([]);

  const addSet = exerciseIndex => {
    const newSets = [...sets];
    newSets[exerciseIndex] = [
      ...(sets[exerciseIndex] || []),
      {weight: '', reps: ''},
    ];
    setSets(newSets);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const newSets = [...sets];
    newSets[exerciseIndex][setIndex] = {
      ...sets[exerciseIndex][setIndex],
      [field]: value,
    };
    setSets(newSets);
  };

  const finishWorkout = async () => {
    try {
      const workoutData = {
        exercises: exerciseNames.map((name, index) => ({
          name,
          sets: sets[index].map(set => ({weight: set.weight, reps: set.reps})),
        })),
      };

      console.log(JSON.stringify(workoutData));

      //   const response = await fetch('https://example.com/api/workouts', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(workoutData),
      //   });
      //   const result = await response.json();
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {exerciseNames.map((name, exerciseIndex) => (
        <View key={exerciseIndex} style={styles.exercise}>
          <Text style={styles.exerciseName}>{name}</Text>
          <Button title="Add set" onPress={() => addSet(exerciseIndex)} />
          {sets[exerciseIndex] &&
            sets[exerciseIndex].map((set, setIndex) => (
              <View key={setIndex} style={styles.set}>
                <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={value =>
                    updateSet(exerciseIndex, setIndex, 'weight', value)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={value =>
                    updateSet(exerciseIndex, setIndex, 'reps', value)
                  }
                />
              </View>
            ))}
        </View>
      ))}
      <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
        <Text style={styles.finishButtonText}>Finish workout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  exercise: {
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  set: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  setNumber: {
    marginRight: 10,
    fontSize: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  finishButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default FinishWorkout;
