import React from 'react';
import useStore from '../Utilities/store';
import modifyRawResponse from '../Utilities/modifyResponse';
import generateResponse from '../Utilities/generatePrompts';


const RawBirthDataComponent = () => {

    const rawBirthData = useStore(state => state.rawBirthData);
    const setModifiedBirthData = useStore(state => state.setModifiedBirthData);
    const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)


    const modifyRaw = () => {
       
        const modified = modifyRawResponse(rawBirthData)
        setModifiedBirthData(JSON.stringify(modified, null, 2))

        const everything = generateResponse('everything', modified)

        const personality = generateResponse('personality', modified)

        const home = generateResponse('home', modified)

        const relationships = generateResponse('relationships', modified)

        const career = generateResponse('career', modified)


        setPromptDescriptionsMap('personality', personality)
        setPromptDescriptionsMap('home', home)
        setPromptDescriptionsMap('relationships', relationships)
        setPromptDescriptionsMap('career', career)
        setPromptDescriptionsMap('everything', everything)


    }

    return (
        <div>
            {rawBirthData !== "" && 
            <div>
            <pre>raw data ready</pre>  
            <button onClick={modifyRaw}>generate prompts</button>
            </div>}
        </div>
    );
};

export default RawBirthDataComponent;
