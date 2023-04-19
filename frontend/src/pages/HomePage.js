import React from 'react';
import NavBar from '../components/NavBar';
import PageTitle from '../components/PageTitle';
import HomeInfo from '../components/HomeInfo';

const HomePage = () =>
{

    return(
      <div>
        <NavBar />
        <PageTitle />
        <HomeInfo />
      </div>
    );
};

export default HomePage;
