import React, { useEffect } from 'react';
import { postGptResponsePlanets, updateHeadingInterpretation } from '../../Utilities/api'; 
import useStore from '../../Utilities/store';
import { 
    findAspectsComputed, 
    describePlanets, 
    describeHouses } from '../../Utilities/generateBirthDataDescriptions'


const PlanetComponent = ({ planet }) => {
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap);
    const planetResponsesMap = useStore(state => state.planetResponsesMap);
    const setPlanetResponsesMap = useStore(state => state.setPlanetResponsesMap);

    const userPlanets = useStore(state => state.userPlanets)
    const userHouses = useStore(state => state.userHouses)
    const userAspects = useStore(state => state.userAspects)  
    const userId = useStore(state => state.userId)

    const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
    const headingInterpretationMap = useStore(state => state.headingInterpretationMap)
    const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
    const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)



    useEffect(() => {
        const birthData = { planets: userPlanets, houses: userHouses, aspectsComputed: userAspects };

        const planetDescription = describePlanets(birthData, planet)
        const houseDescription = describeHouses(birthData, planet)
        const aspectDescription = findAspectsComputed(birthData, planet)

        const combinedDescriptions = [
            ...(Array.isArray(planetDescription) ? planetDescription : [planetDescription]),
            ...houseDescription,
            ...aspectDescription
        ];

        console.log(combinedDescriptions)
        setSubHeadingsPromptDescriptionsMap(planet, combinedDescriptions)
        
        // extract any description of the planet
    }, [planet, userPlanets, userHouses, userAspects]);



    async function generateResponse() {
        if (!planet || planet === '') {
            console.error('Planet or planet type is undefined');
            return;
        }
        console.log("generate planet response");
        const modifiedInput = promptDescriptionsMap['everything'] + "\n" +  planet.toUpperCase() + " ANALYSIS";
        try {
            const response = await postGptResponsePlanets(modifiedInput);
            // setPlanetResponsesMap(planet, response);
            setHeadingInterpretationMap(planet, response)
        
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const saveHeadingInterpretation = async (heading) => {
        try {
            const interpretation = headingInterpretationMap[heading];
            const promptDescription = subHeadingsPromptDescriptionsMap[heading];
            // if intepretation and/or promptDescription are empty strings, don't save
            if (!interpretation || !promptDescription) {
                return;
            }

            await updateHeadingInterpretation(userId, heading, promptDescription, interpretation);
        } catch (error) {
            console.error('Failed to save interpretation:', error);
        }
    };

    return (
        <div className="planet-component">
            <div>
                <h4 style={{ color: 'white' }}>{planet}</h4>
                {subHeadingsPromptDescriptionsMap[planet] && subHeadingsPromptDescriptionsMap[planet].length > 0 && (
                    <div style={{ color: 'white' }}>
                        <pre style={{ color: 'white' }}>
                            {subHeadingsPromptDescriptionsMap[planet].join('\n')}
                        </pre>
                        <button onClick={generateResponse}>Generate Planet Interpretation</button>
                    </div>
                )}
            </div>
            {headingInterpretationMap[planet] !== "" && (
                <div>
                    <div className="planet-response">
                        <pre>{headingInterpretationMap[planet]}</pre>  
                    </div>
                    <button onClick={() => saveHeadingInterpretation(planet)}>Save Interpretation</button>
                </div>
            )}
        </div>
    );
};

export default PlanetComponent;





// const PlanetComponent = ({ planet }) => {
//     const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap);
//     const planetResponsesMap = useStore(state => state.planetResponsesMap);
//     const setPlanetResponsesMap = useStore(state => state.setPlanetResponsesMap);

//     useEffect(() => {
//         // Check if the planet response is already fetched
//         if (!planetResponsesMap[planet] || planetResponsesMap[planet] === '') {
//             generateResponse();
//         }
//     }, [planet, promptDescriptionsMap, planetResponsesMap]);

//     async function generateResponse() {
//         if (!planet || planet === '') {
//             console.error('Planet or planet type is undefined');
//             return;
//         }
//         console.log("generate planet response");
//         const modifiedInput = promptDescriptionsMap['everything'] + "\n" +  planet.toUpperCase() + " ANALYSIS";
//         try {
//             const response = await postGptResponsePlanets(modifiedInput);
//             setPlanetResponsesMap(planet, response);
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }

//     return (
//         <div className="planet-component">
//             <div>
//                 <h4>{planet}</h4>
//                 <button onClick={generateResponse}>Generate Planet Interpretation</button>
//             </div>
//             {planetResponsesMap[planet] !== "" && (
//                 <div className="planet-response">
//                     <pre>{planetResponsesMap[planet]}</pre>  
//                 </div>
//             )}
//         </div>
//     );
// };

