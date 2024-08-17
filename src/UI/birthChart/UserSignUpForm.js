
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loader } from "@googlemaps/js-api-loader";
import ResponseContext from '../../Utilities/ResponseContext';
import { updateObjectKeys } from '../../Utilities/helpers';


import GoogleAutocomplete from 'react-google-autocomplete';
import { fetchTimeZone, postBirthData, postDailyTransit, postProgressedChart, postPromptGeneration, postPeriodTransits, postPeriodTransitsForUserChart, createUserProfile} from '../../Utilities/api'; 
import useStore from '../../Utilities/store';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

const UserSignUpForm = () => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const setRawBirthData = useStore(state => state.setRawBirthData);
    const setBirthDate = useStore(state => state.setBirthDate);
    const setAscendantDegree = useStore(state => state.setAscendantDegree)
    const setUserId = useStore(state => state.setUserId);
  
    const validateForm = () => {
      const errors = {};
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim()) errors.lastName = "Last name is required";
      if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid";
      if (!date) errors.date = "Date is required";
      if (!time) errors.time = "Time is required";
      if (!lat || !lon) errors.location = "Location is required";
      return errors;
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
  
      setRawBirthData('');
      setBirthDate({});
   
      try {
          const dateTimeString = `${date}T${time}:00`;
          const dateTime = new Date(dateTimeString);
          const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
          const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);
          console.log(`Time Zone Offset in Hours: ${totalOffsetHours}`);
          const birthData = {
              date: date,
              time: time,
              lat: lat,
              lon: lon,
              tzone: totalOffsetHours,
          };
          setBirthDate(birthData);
          const response = await postBirthData(birthData);
          console.log(" CHART DATA ");
          console.log(response.chartData);

          const dateOfBirth = dateTimeString
          console.log("date of birth " + dateOfBirth)

          // pass in response.chartData.houses (and maybe response.chartData.aspects) to createUserProfile
          const userid = await createUserProfile(
            email, 
            firstName, 
            lastName, 
            dateOfBirth, 
            placeOfBirth, 
            time, 
            totalOffsetHours, 
            response.chartData
        );
          console.log(JSON.stringify(userid) + " userid");
          setAscendantDegree(response.chartData['ascendant']);
          setRawBirthData(response.chartData);
          if (userid) {
            console.log('User profile created successfully');
            setUserId(userid);
            navigate('/confirmation');
          } else {
            console.error('Failed to create user profile');
          }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    };
    
    return (
      <div className="email_form">
        <form onSubmit={handleSubmit}>
          <div>
            <span style={{ color: 'white' }}>I'm </span>
            <input 
              type="text" 
              id="fname" 
              name="fname" 
              placeholder="First Name" 
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              style={{ color: 'white' }}
            />
            <input 
              type="text" 
              id="lname" 
              name="lname" 
              placeholder="Last Name" 
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              style={{ color: 'white' }}
            />
            <span style={{ color: 'white' }}>. My Email is </span>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email Address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ color: 'white' }}
            />
          </div>
          <label htmlFor="date" style={{ color: 'white' }}>Date:</label>
        <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} /><br /><br />

        <label htmlFor="time" style={{ color: 'white' }}>Time:</label>
        <input type="time" id="time" name="time" value={time} onChange={e => setTime(e.target.value)} /><br /><br />

        <label htmlFor="location" style={{ color: 'white' }}>Location:</label>
          <div>
          <GoogleAutocomplete
              inputProps={{
                  name: 'location',
                  placeholder: 'Place of Birth',
              }}
              apiKey={GOOGLE_API}
              onPlaceSelected={(place) => {
                  var lat = place.geometry.location.lat();
                  var lon = place.geometry.location.lng();
                  console.log(lat + "lat" + lon + "lon");
                  setLat(lat);
                  setLon(lon);
                  setPlaceOfBirth(place.formatted_address);
              }}
          />
          </div>
          <input className="email-submit-btn" type="submit" value="Submit" style={{ color: 'white' }}/>

        </form>
        {Object.keys(formErrors).length > 0 && (
          <div style={{ color: 'red' }}>
            {Object.values(formErrors).map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default UserSignUpForm;



// const UserSignUpForm = () => {
//   const [date, setDate] = useState('');
//   const [time, setTime] = useState('');
//   const [lat, setLat] = useState('');
//   const [lon, setLon] = useState('');

//   const setRawBirthData = useStore(state => state.setRawBirthData);
//   const setBirthDate = useStore(state => state.setBirthDate);

//   const setAscendantDegree = useStore(state => state.setAscendantDegree)
//   const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)

//   function getStartAndEndDate() {
//     const currentDate = new Date();
//     const startDate = currentDate.toISOString();

//     const endDate = new Date(currentDate);
//     endDate.setMonth(endDate.getMonth() + 1);
//     const endDateString = endDate.toISOString();

//     return { startDate, endDate: endDateString };
// }


//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setRawBirthData('')
//     setBirthDate({})
 
//     try {
//         const dateTimeString = `${date}T${time}:00`; // Adding ':00' for seconds
//         const dateTime = new Date(dateTimeString);
//         const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
//         const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);
//         console.log(`Time Zone Offset in Hours: ${totalOffsetHours}`);
//         const birthData = {
//             date: date,
//             time: time,
//             lat: lat,
//             lon: lon,
//             tzone: totalOffsetHours,
//         };
//         setBirthDate(birthData)
//         const response = await postBirthData(birthData)
//         console.log(" CHART DATA ")
//         console.log(response.chartData)
//         const periodTransitsTest = await createUserProfile(email, firstName, lastName, dateOrBirth, placeOfBirth, response.chartData.planets)
//         console.log(periodTransitsTest)
//         setAscendantDegree(response.chartData['ascendant'])
//         setRawBirthData(response.chartData);


//     } catch (error) {
//       console.error('Error submitting form:', error);
//       setRawBirthData(`Error: ${error.message}`);
//     }
//   };
  

//   return (
//     <div className="email_form">
//       <form onSubmit={handleSubmit}>
//       `<div>
//           <span style={{ color: 'white' }}>I'm </span>
//           <input type="text" id="fname" name="fname" placeholder="Enter your Full Name" style={{ color: 'white' }}/>
//           <span style={{ color: 'white' }}>. My Email is </span>
//           <input type="text" id="email" name="email" placeholder="Email Address" style={{ color: 'white' }}/>
//         </div>
//         <label htmlFor="date" style={{ color: 'white' }}>Date:</label>
//         <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} /><br /><br />

//         <label htmlFor="time" style={{ color: 'white' }}>Time:</label>
//         <input type="time" id="time" name="time" value={time} onChange={e => setTime(e.target.value)} /><br /><br />

//         <label htmlFor="location" style={{ color: 'white' }}>Location:</label>

//         <div>
//         <GoogleAutocomplete
//             inputProps={{
//                 name: 'location',
//             }}
//             apiKey={GOOGLE_API}
//             onPlaceSelected={(place) => {
//                 var lat = place.geometry.location.lat();
//                 var lon = place.geometry.location.lng();
//                 console.log(lat + "lat" + lon + "lon")
//                 setLat(lat)
//                 setLon(lon)
//                 }}
//             />
            
//         </div>
//         <input type="submit" value="Submit" style={{ color: 'white' }}/>
//       </form>
//     </div>
//   );
// };

// export default UserSignUpForm;



