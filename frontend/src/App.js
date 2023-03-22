import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" index element={<LoginPage />} />
      <Route path="/RegisterPage" index element={<RegisterPage />} />
      <Route path="/HomePage" index element={<HomePage />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;

