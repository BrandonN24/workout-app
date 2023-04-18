import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import SearchExercises from '../components/SearchExercises';
import Exercises from '../components/Exercises';


const WorkoutsPage = () =>
{
  const [exercises, setExercises] = useState([]);
  const [bodyPart, setBodyPart] = useState('all');

    return(
      <div>
        <NavBar />
        <SearchExercises setExercises={setExercises} bodyPart={bodyPart} setBodyPart={setBodyPart} />
        <Exercises setExercises={setExercises} exercises={exercises} bodyPart={bodyPart} />
      </div>
    );
};

export default WorkoutsPage;