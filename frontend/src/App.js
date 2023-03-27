import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddInfoPage from './pages/AddInfoPage';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" index element={<LoginPage />} />
      <Route path="/RegisterPage" index element={<RegisterPage />} />
      <Route path="/HomePage" index element={<HomePage />} />
      <Route path="/AddInfoPage" index element={<AddInfoPage />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;

