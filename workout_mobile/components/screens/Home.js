import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import jwt_decode from 'jwt-decode'; // for decoding JWT token

const Home = ({navigation}) => {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    // Decode JWT token to get workout information
    const token = 'YOUR_JWT_TOKEN_HERE';
    let decodedToken;
    try {
      decodedToken = jwt_decode(token);
    } catch (err) {
      //console.error(err);
      decodedToken = {};
    }
    const workoutData = decodedToken.workouts || [];
    setWorkouts(workoutData);
  }, []);

  const renderWorkoutItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.cell}
        onPress={() => navigation.navigate('WorkoutDetails', {workout: item})}>
        <Text style={styles.cellText}>{item.date}</Text>
        <Text style={styles.cellText}>{item.name}</Text>
        <Text style={styles.cellText}>{item.duration}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {workouts.length > 0 ? (
        <>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Date</Text>
            <Text style={styles.headerText}>Workout Name</Text>
            <Text style={styles.headerText}>Duration</Text>
          </View>
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </>
      ) : (
        <Text style={styles.titleText}>Welcome</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
  },
  cell: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  cellText: {
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default Home;
