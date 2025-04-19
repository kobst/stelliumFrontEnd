import React, { useEffect, useState } from 'react';

import { updateObjectKeys } from '../Utilities/generateUserTranstiDescriptions';

import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../Utilities/store';
import DailyReading from '../UI/landingPage/DailyReading'
import DailyReadingFromDb from '../UI/landingPage/DailyReadingFromDb';
import DailySignHoroscopeMenu from '../UI/landingPage/DailySignHoroscopeMenu';
import { PeriodTransits } from '../UI/landingPage/PeriodTransits';
import Ephemeris from '../UI/shared/Ephemeris';
import { TransitAspects } from '../UI/landingPage/transitAspects';
import TodaysAspectsTable from '../UI/landingPage/TodaysAspectsTable';
import UserSignUpForm from '../UI/landingPage/UserSignUpForm';
import { formatTransitDataForTable, 
  handleFetchDailyAspects, 
  handleFetchDailyTransits,
  handleFetchPeriodAspects,
  handleFetchRetrogrades,
  handleFetchInstantAspects,
  handleFetchPeriodTransits  } from '../Utilities/generateUserTranstiDescriptions';



import { postDailyTransits, postPeriodTransits, postDailyAspects, postPeriodAspects, postDailyRetrogrades } from '../Utilities/api'


const SignUpPage = () => {     
    return (
        <div className="container">

            {/* Main Text */}
            <img className="lightlogo" src={lightLogo} alt="Stellium logo" />
            <div className="maintxt mont-font">
                <h1 className="logotxt">STELLIUM</h1>
                <h3 className="logosubtxt">ancient wisdom of the stars, the technology of the future</h3>
                <h2 className="soon">coming soon</h2>
            </div>
            <img src={whiteLine} alt="" />
            <div>
                <h2>Cast your Chart, Get Your Free Horoscope</h2>
                <p>Enter your birth information and let Stellium translate the tapestry of the Cosmos into a personalized guide to your life's destiny</p>
            </div>

            <UserSignUpForm />
        </div>
    );
}

export default SignUpPage;
