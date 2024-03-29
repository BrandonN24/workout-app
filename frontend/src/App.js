import React from 'react';
import './App.css';
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddInfoPage from './pages/AddInfoPage';
import WorkoutsPage from './pages/WorkoutsPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import ExerciseDetail from './pages/ExerciseDetail';
import EmailVerificationPage from './pages/EmailVerificationPage';
import NewPasswordPage from './pages/NewPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';


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
      <Route path="/EmailVerificationPage" index element={<EmailVerificationPage />} />
      <Route path="/ForgotPasswordPage" index element={<ForgotPasswordPage />} />
      <Route path="/NewPasswordPage" index element={<NewPasswordPage />} />
      
    </Routes>
  </BrowserRouter>
);
}

export default App;

