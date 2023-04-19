import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddInfoPage from './pages/AddInfoPage';
import WorkoutsPage from './pages/WorkoutsPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import ExerciseDetail from './pages/ExerciseDetail';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" index element={<LoginPage />} />
      <Route path="/RegisterPage" index element={<RegisterPage />} />
      <Route path="/HomePage" index element={<HomePage />} />
      <Route path="/AddInfoPage" index element={<AddInfoPage />} />
      <Route path="/WorkoutsPage" index element={<WorkoutsPage />} />
      <Route path="/HistoryPage" index element={<HistoryPage />} />
      <Route path="/StatsPage" index element={<StatsPage />} />
      <Route path="/exercise/:id" element={<ExerciseDetail />} />
      
    </Routes>
  </BrowserRouter>
);
}

export default App;

