import React from 'react';

import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import UserSignUpForm from '../UI/landingPage/UserSignUpForm';

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
