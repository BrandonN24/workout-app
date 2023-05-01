import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import jwt_decode from 'jwt-decode'; // for decoding JWT token
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';
import {useIsFocused} from '@react-navigation/native';

const Home = ({navigation}) => {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [searchTerm, setSearchText] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let token = await AsyncStorage.getItem('token');
        const decodedToken = jwt_decode(token);
        let sendID = {
          login: decodedToken.login,
          jwtToken: token,
        };
        let jsIdObj = JSON.stringify(sendID);
        const parsedIdObj = JSON.parse(jsIdObj);
        const getWorkouts = await client.post('/api/getWorkout', {
          ...parsedIdObj,
        });
        //console.log('these are the workouts ');
        //console.log(getWorkouts.data.workouts);
        await AsyncStorage.setItem(
          'token',
          getWorkouts.data.refreshedToken.accessToken,
        );
        setWorkouts(getWorkouts.data.workouts);
      } catch (error) {
        console.log(error);
      }
    };

    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const handleSearch = text => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = workouts.filter(workout =>
        workout.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredWorkouts(filtered);
    } else {
      setFilteredWorkouts([]);
    }
  };

  const renderWorkoutItem = ({item}) => {
    const handleDelete = async () => {
      try {
        let token = await AsyncStorage.getItem('token');
        const decodedToken = jwt_decode(token);
        let data = {
          wName: item.name,
          login: decodedToken.login,
          jwtToken: token,
        };
        //console.log(data);
        let jsonData = JSON.stringify(data);
        let parseData = JSON.parse(jsonData);
        const response = await client.post('/api/deleteWorkout', {
          ...parseData,
        });
        //console.log(response);
        await AsyncStorage.setItem(
          'token',
          response.data.refreshedToken.accessToken,
        );
        setWorkouts(prevWorkouts =>
          prevWorkouts.filter(workout => workout.name !== item.name),
        );
      } catch (error) {
        console.log(error);
      }
    };

    const handleAlert = () => {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete ${item.name}?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Delete', onPress: handleDelete},
        ],
      );
    };

    return (
      <TouchableOpacity
        style={styles.cell}
        onPress={() => navigation.navigate('WorkoutDetails', {workout: item})}>
        <Text style={styles.cellText}>{item.dateDone}</Text>
        <Text style={styles.cellText}>{item.name}</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleAlert}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          onChangeText={handleSearch}
          value={searchTerm}
          placeholder="Search Workouts"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {filteredWorkouts.length > 0 ? (
        <>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Date</Text>
            <Text style={styles.headerText}>Workout Name</Text>
          </View>
          <FlatList
            data={filteredWorkouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </>
      ) : workouts.length > 0 ? (
        <>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Date</Text>
            <Text style={styles.headerText}>Workout Name</Text>
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
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginRight: 10,
    paddingLeft: 10,
  },
  searchButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Home;
