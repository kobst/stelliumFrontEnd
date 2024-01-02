// store.js
import create from 'zustand';

const useStore = create(set => ({
  rawBirthData: '',
  setRawBirthData: (response) => set({ rawBirthData: response }),
  
  modifiedBirthData: '',
  setModifiedBirthData: (response) => set({ modifiedBirthData: response }),

    // Prompt descriptions mapping
    promptDescriptionsMap: {
        'everything': '',
        'personality': '',
        'home': '',
        'career': '',
        'relationships': '',
        },

        // Function to set prompt descriptions in the map
    setPromptDescriptionsMap: (key, description) => set(state => ({
        promptDescriptionsMap: { ...state.promptDescriptionsMap, [key]: description }
        })),

        // Prompt descriptions mapping
    planetResponsesMap: {
            'Sun': '',
            'Moon': '',
            'Ascendant': '',
            'Mercury': '',
            'Venus': '',
            'Mars': '',
            'Saturn': '',
            'Jupiter': '',
            'Uranus': '',
            'Neptune': '',
            'Pluto': '',
            },
    
            // Function to set prompt descriptions in the map
    setPlanetResponsesMap: (key, description) => set(state => ({
        planetResponsesMap: { ...state.planetResponsesMap, [key]: description }
    })),
}));

export default useStore;
