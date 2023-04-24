import React from "react";
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
      <nav>
        <ul>
          <Link to="/HomePage">
            Home
            </Link>
          <Link to="/WorkoutsPage">
            Exercises
          </Link>
          <Link to="/HistoryPage">
            History
          </Link>
          <Link to="/StatsPage">
            Stats
          </Link>
          <Link to="/">
            Logout
            </Link>
        </ul>
      </nav>
  );
};

export default NavBar;