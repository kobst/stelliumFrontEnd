import { signs } from "./constants";

function generatePlanetObject(name, rawResponse, house) {
    let ascendantDegree = rawResponse[name];
    let normalDegree = ascendantDegree;
    let signId = 1;
    while (normalDegree > 30) {
      signId += 1;
      normalDegree -= 30;
    }
  
    name = name.charAt(0).toUpperCase() + name.slice(1);
  
    const newObject = {
      name: name,
      full_degree: ascendantDegree,
      norm_degree: normalDegree,
      speed: 0.4995,
      is_retro: false,
      sign_id: signId,
      sign: signs[signId - 1],
      house: house
    };
  
    return newObject;
  }

function addSouthNode(rawResponse) {
    for (let planetObject of rawResponse["planets"]) {
      if (planetObject["name"] === "Node") {
        let fullDegree = planetObject["fullDegree"] + 180;
        let house = planetObject["house"] + 6;
  
        if (fullDegree > 360) {
          fullDegree -= 360;
        }
  
        if (house > 12) {
          house -= 12;
        }
  
        let signId = 1;
        let normalDegree = fullDegree;
        while (normalDegree > 30) {
          signId += 1;
          normalDegree -= 30;
        }
  
        const southNodeObject = {
          name: "South Node",
          full_degree: fullDegree,
          norm_degree: normalDegree,
          speed: 0.4995,
          is_retro: false, // Assuming you want a boolean value here, as in the earlier example
          sign_id: signId,
          sign: signs[signId - 1], // Assumes 'signs' array is defined elsewhere
          house: house
        };
  
        return southNodeObject;
      }
    }
  }
  
function modifyRawResponse(rawResponse) {
    const ascendantObject = generatePlanetObject("ascendant", rawResponse, 1);
    const midheavenObject = generatePlanetObject("midheaven", rawResponse, 10);
    // console.log(rawResponse)
    const southNodeObject = addSouthNode(rawResponse); // Assuming addSouthNode is defined elsewhere
  
    rawResponse["planets"].splice(10, 0, ascendantObject);
    rawResponse["planets"].splice(11, 0, midheavenObject);
    rawResponse["planets"].splice(13, 0, southNodeObject);
  
    return rawResponse;
  }

export default modifyRawResponse