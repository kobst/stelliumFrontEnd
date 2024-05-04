
import React from 'react';
// import './landingPage.css'


import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'


const LandingPageComponent = () => {
    return (
        <div className="container">
            {/* Planet Animation */}
            {/* <div className="planet-cont">
                <div className="sun"></div>
                <div className="mercury-outline"><div className="mercury"></div></div>
                <div className="venus-outline"><div className="venus"></div></div>
                <div className="earth-outline">
                    <div className="earth">
                        <div className="earth-circle"><div className="earth-inner"></div></div>
                    </div>
                </div>
                <div className="mars-outline">
                    <div className="mars">
                        <div className="mars-circle"><div className="mars-inner"></div></div>
                    </div>
                </div>
                <div className="jupiter-outline">
                    <div className="jupiter">
                        <div className="jupiter-circle">
                            <div className="jupiter-inner"></div>
                            <div className="jupiter-circle2"><div className="jupiter-inner2"></div></div>
                        </div>
                    </div>
                </div>
                <div className="saturn-outline">
                    <div className="saturn">
                        <div className="saturn-circle">
                            <div className="saturn-inner"></div>
                            <div className="saturn-circle2"><div className="saturn-inner2"></div></div>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Main Text */}
            <img className="lightlogo" src={lightLogo} alt="Stellium logo" />
            <div className="maintxt mont-font">
                <h1 className="logotxt">STELLIUM</h1>
                <h3 className="logosubtxt">ancient wisdom of the stars, the technology of the future</h3>
                <h2 className="soon">coming soon</h2>
            </div>
            <img src={whiteLine} alt="" />

            {/* Form */}
            <div className="email_form">
                <h2>Hi Stellium, Let me know when you're online</h2>
                <div>
                    <span>I'm </span>
                    <input type="text" id="fname" name="fname" placeholder="Enter your Full Name" />
                    <span>. My Email is </span>
                    <input type="text" id="email" name="email" placeholder="Email Address" />
                    <br />
                    <a href="#" className="email-submit-btn">submit</a>
                </div>
            </div>
        </div>
    );
}

export default LandingPageComponent;
