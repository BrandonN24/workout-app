import axios from 'axios';

const client = axios.create({
  baseURL: 'https://workout-app-cop4331.herokuapp.com',
});

export default client;
