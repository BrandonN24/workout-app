import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import client from '../../api/client';
import jwt_decode from 'jwt-decode';

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
      let token = await AsyncStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      //console.log(decodedToken);

      let wName = await AsyncStorage.getItem('workoutName');

      let workoutData = {
        wName: wName,
        login: decodedToken.login,
        exercises: exerciseNames.map((name, index) => ({
          Name: name,
          effort: 5,
          public: decodedToken.login,
          Sets: sets[index].map(set => ({weight: set.weight, reps: set.reps})),
        })),
        jwtToken: token,
      };
      //console.log(JSON.stringify(workoutData));
      let sendWorkout = JSON.stringify(workoutData);
      let parseWorkout = JSON.parse(sendWorkout);
      //console.log(parseWorkout);
      const response = await client.post('/api/completeWorkout', {
        ...parseWorkout,
      });
      await AsyncStorage.setItem(
        'token',
        response.data.refreshedToken.accessToken,
      );
      //console.log('Workout added');
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
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
    </ScrollView>
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
  scrollViewContainer: {
    flexGrow: 1, // allows the content to expand to fill the available space
    // horizontally centers the content
    paddingTop: 20, // adds some padding to the top of the content
    paddingBottom: 20, // adds some padding to the bottom of the content
  },
});

export default FinishWorkout;
