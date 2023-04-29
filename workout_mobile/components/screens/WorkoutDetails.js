import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const WorkoutDetails = ({route}) => {
  const {workout} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{workout.name}</Text>
      <Text style={styles.detailText}>Date: {workout.dateDone}</Text>
      {/* <Text style={styles.detailText}>
        Duration: {workout.duration} minutes
      </Text> */}
      <Text style={styles.exerciseTitleText}>Exercises:</Text>
      {workout.exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseContainer}>
          <Text style={styles.exerciseName}>{exercise.Name}</Text>
          <View style={styles.setsContainer}>
            {exercise.Sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setTextContainer}>
                <Text style={styles.setText}>
                  Set {setIndex + 1}: {set.reps} reps @ {set.weight} lbs
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 18,
    marginBottom: 10,
  },
  exerciseTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  exerciseContainer: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -5,
  },
  setTextContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  setText: {
    fontSize: 14,
  },
});

export default WorkoutDetails;
