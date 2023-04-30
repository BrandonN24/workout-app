import React from "react";
import { Link } from 'react-router-dom';
import './../css/NavBar.css';

const NavBar = () => {

  const logout = async event =>
  {
    localStorage.clear();
  }

  return (
      <nav>
        <ul>
          <Link class="linkBar" to="/HomePage">
            Home
            </Link>
          <Link class="linkBar" to="/WorkoutsPage">
            Exercises
          </Link>
          <Link class="linkBar" to="/HistoryPage">
            History
          </Link>
          <Link class="linkBar" to="/StatsPage">
            Stats
          </Link>
          <Link class="linkBar" onClick={logout} to="/">
            Logout
            </Link>
        </ul>
      </nav>
  );
};

export default NavBar;