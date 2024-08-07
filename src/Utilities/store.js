// store.js
import create from 'zustand';

const useStore = create(set => ({

    birthDate: {},
    setBirthDate: (response) => set({ birthDate: response}),

  rawBirthData: '',
  setRawBirthData: (response) => set({ rawBirthData: response }),

  ascendantDegree: 0,
  setAscendantDegree: (response) => set({ ascendantDegree: response }),

  dailyTransits: [],
  setDailyTransits: (response) => set({dailyTransits: response}),

  dailyPersonalTransitDescriptions: '',
  setDailyPersonalTransitDescriptions: (response) => set({dailyPersonalTransitDescriptions: response}),

  dailyTransitDescriptions: '',
  setDailyTransitDescriptions: (response) => set({dailyTransitDescriptions: response}),

  progressedTransitDescriptions: '',
  setProgressedTransitDescriptions: (response) => set({progressedTransitDescriptions: response}),
  
//   modifiedBirthData: '',
//   setModifiedBirthData: (response) => set({ modifiedBirthData: response }),

  progressedBirthData: '',
  setProgressedBirthData: (response) => set({ progressedBirthData: response }),

    // Prompt descriptions mapping
    promptDescriptionsMap: {
        'everything': '',
        'personality': '',
        'home': '',
        'career': '',
        'relationships': '',
        'communication': '',
        'unconscious': '',
        'quadrants': '',
        'elements': '',
        'modalities': '',
        'pattern': ''
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

    dominanceResponsesMap: {
        'Quadrant': '',
        'Element': '',
        'Modality': '',
        },   

        // Function to set prompt descriptions in the map
    setDominanceResponsesMap: (key, description) => set(state => ({
        dominanceResponsesMap: { ...state.dominanceResponsesMap, [key]: description }
    })),

    bigFourResponsesMap: {
        'Personal Identity and Self-Image': '',
        'Outward Expression and Appearance': '',
        'Inner Self and Emotional Dynamics': '',
        'Challenges and Tension': '',
        'Path of Integration': '',
        'Emotional Foundations and Security Needs': '',
        'Family Dynamics and Past Influences': '',
        'Home Environment and Preferences': '',
        'Challenges and Growth in Family Life': '',
        'Role of Tradition and Legacy': '',
        'Synthesizing a Harmonious Physical and Emotional Home': '',
        'Core Relationship Desires and Boundaries': '',
        'Love Style: Expression and Attraction': '',
        'Sexual Nature and Intimacy': '',
        'Commitment Approach and Long-term Vision': '',
        'Challenges and Growth in Relationships': '',
        'Romantic Summary': '',
        'Career Motivations and Ambitions': '',
        'Public Image, Reputation, and Leadership Style': '',
        'Challenges and Growth Opportunities in Profession': '',
        'Skills, Talents, and Strengths': '',
        'Summary and Path To Success': ''
    },

    setBigFourMap: (key, description) => set(state => ({
        bigFourResponsesMap: { ...state.bigFourResponsesMap, [key]: description }
    })),
}));

export default useStore;

