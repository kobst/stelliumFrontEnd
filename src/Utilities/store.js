// store.js
import create from 'zustand';
import { HeadingEnum } from './constants';


const useStore = create(set => ({

    userData: null,
    setUserData: (data) => set({ userData: data }),

    birthDate: '',
    setBirthDate: (response) => set({ birthDate: response}),

    userId: '',
    setUserId: (response) => set({ userId: response }),

    selectedUser: {},
    setSelectedUser: (response) => set({ selectedUser: response }),

  rawBirthData: {},
  setRawBirthData: (response) => set({ rawBirthData: response }),

  userBirthChart: {},
  setUserBirthChart: (response) => set({ userBirthChart: response }),

  userPlanets: [],
  setUserPlanets: (response) => set({ userPlanets: response }),

  userHouses: [],
  setUserHouses: (response) => set({ userHouses: response }),

  userAspects: [],
  setUserAspects: (response) => set({ userAspects: response }),

  userPeriodTransits: [],
  setUserPeriodTransits: (response) => set({ userPeriodTransits: response }),

  userPeriodHouseTransits: {},
  setUserPeriodHouseTransits: (response) => set({ userPeriodHouseTransits: response }),

  dailyTransits: [],
  setDailyTransits: (response) => set({dailyTransits: response}),

  retrogradeTransits: [],
  setRetrogradeTransits: (response) => set({retrogradeTransits: response}),

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
        'Quadrants': '',
        'Elements': '',
        'Modalities': '',
        'Pattern': ''
        },

        // Function to set prompt descriptions in the map
    setPromptDescriptionsMap: (key, description) => set(state => ({
        promptDescriptionsMap: { ...state.promptDescriptionsMap, [key]: description }
        })),

    compositeChart: null,
    setCompositeChart: (response) => set({ compositeChart: response }),

    compositeChartPromptDescriptionsMap: {},
    setCompositeChartPromptDescriptionsMap: (key, description) => set(state => ({
        compositeChartPromptDescriptionsMap: { ...state.compositeChartPromptDescriptionsMap, [key]: description }
        })),

    compositeChartPlanetResponsesMap: {},
    setCompositeChartPlanetResponsesMap: (key, description) => set(state => ({
        compositeChartPlanetResponsesMap: { ...state.compositeChartPlanetResponsesMap, [key]: description }
        })),

    compositeChartHeadingInterpretationMap: {},
    setCompositeChartHeadingInterpretationMap: (key, description) => set(state => ({
        compositeChartHeadingInterpretationMap: { ...state.compositeChartHeadingInterpretationMap, [key]: description }
        })),

    synastryPromptDescriptionsMap: {},
    setSynastryPromptDescriptionsMap: (key, description) => set(state => ({
        synastryPromptDescriptionsMap: { ...state.synastryPromptDescriptionsMap, [key]: description }
    })),

    synastryHeadingInterpretationMap: {},
    setSynastryHeadingInterpretationMap: (key, description) => set(state => ({
        synastryHeadingInterpretationMap: { ...state.synastryHeadingInterpretationMap, [key]: description }
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

    headingInterpretationMap: {
        [HeadingEnum.PERSONAL_IDENTITY]: '',
        [HeadingEnum.OUTWARD_EXPRESSION]: '',
        [HeadingEnum.INNER_SELF]: '',
        [HeadingEnum.CHALLENGES_TENSION]: '',
        [HeadingEnum.PATH_INTEGRATION]: '',
        [HeadingEnum.EMOTIONAL_FOUNDATIONS]: '',
        [HeadingEnum.FAMILY_DYNAMICS]: '',
        [HeadingEnum.HOME_ENVIRONMENT]: '',
        [HeadingEnum.FAMILY_CHALLENGES]: '',
        [HeadingEnum.HARMONIOUS_HOME]: '',
        [HeadingEnum.RELATIONSHIP_DESIRES]: '',
        [HeadingEnum.LOVE_STYLE]: '',
        [HeadingEnum.SEXUAL_NATURE]: '',
        [HeadingEnum.COMMITMENT_APPROACH]: '',
        [HeadingEnum.RELATIONSHIP_CHALLENGES]: '',
        [HeadingEnum.ROMANTIC_SUMMARY]: '',
        [HeadingEnum.SOCIAL_NETWORKS]: '',
        [HeadingEnum.CAREER_MOTIVATIONS]: '',
        [HeadingEnum.PUBLIC_IMAGE]: '',
        [HeadingEnum.CAREER_CHALLENGES]: '',
        [HeadingEnum.SKILLS_TALENTS]: '',
        [HeadingEnum.CAREER_SUMMARY]: '',
        [HeadingEnum.PSYCHOLOGICAL_PATTERNS]: '',
        [HeadingEnum.SPIRITUAL_GROWTH]: '',
        [HeadingEnum.KARMIC_LESSONS]: '',
        [HeadingEnum.TRANSFORMATIVE_EVENTS]: '',
        [HeadingEnum.COMMUNICATION_STYLES]: '',
        [HeadingEnum.PHILOSOPHICAL_BELIEFS]: '',
        [HeadingEnum.TRAVEL_EXPERIENCES]: '',
        [HeadingEnum.QUADRANTS]: '',
        [HeadingEnum.ELEMENTS]: '',
        [HeadingEnum.MODALITIES]: '',
        [HeadingEnum.PATTERN]: '',
        [HeadingEnum.SUN]: '',
        [HeadingEnum.MOON]: '',
        [HeadingEnum.ASCENDANT]: '',
        [HeadingEnum.MERCURY]: '',
        [HeadingEnum.VENUS]: '',
        [HeadingEnum.MARS]: '',
        [HeadingEnum.SATURN]: '',
        [HeadingEnum.JUPITER]: '',
        [HeadingEnum.URANUS]: '',
        [HeadingEnum.NEPTUNE]: '',
        [HeadingEnum.PLUTO]: ''
    },

    setHeadingInterpretationMap: (key, description) => set(state => ({
        headingInterpretationMap: { ...state.headingInterpretationMap, [key]: description }
    })),

    subHeadingsPromptDescriptionsMap: {
        [HeadingEnum.PERSONAL_IDENTITY]: '',
        [HeadingEnum.OUTWARD_EXPRESSION]: '',
        [HeadingEnum.INNER_SELF]: '',
        [HeadingEnum.CHALLENGES_TENSION]: '',
        [HeadingEnum.PATH_INTEGRATION]: '',
        [HeadingEnum.EMOTIONAL_FOUNDATIONS]: '',
        [HeadingEnum.FAMILY_DYNAMICS]: '',
        [HeadingEnum.HOME_ENVIRONMENT]: '',
        [HeadingEnum.FAMILY_CHALLENGES]: '',
        [HeadingEnum.HARMONIOUS_HOME]: '',
        [HeadingEnum.RELATIONSHIP_DESIRES]: '',
        [HeadingEnum.LOVE_STYLE]: '',
        [HeadingEnum.SEXUAL_NATURE]: '',
        [HeadingEnum.COMMITMENT_APPROACH]: '',
        [HeadingEnum.RELATIONSHIP_CHALLENGES]: '',
        [HeadingEnum.ROMANTIC_SUMMARY]: '',
        [HeadingEnum.SOCIAL_NETWORKS]: '',
        [HeadingEnum.CAREER_MOTIVATIONS]: '',
        [HeadingEnum.PUBLIC_IMAGE]: '',
        [HeadingEnum.CAREER_CHALLENGES]: '',
        [HeadingEnum.SKILLS_TALENTS]: '',
        [HeadingEnum.CAREER_SUMMARY]: '',
        [HeadingEnum.PSYCHOLOGICAL_PATTERNS]: '',
        [HeadingEnum.SPIRITUAL_GROWTH]: '',
        [HeadingEnum.KARMIC_LESSONS]: '',
        [HeadingEnum.TRANSFORMATIVE_EVENTS]: '',
        [HeadingEnum.COMMUNICATION_STYLES]: '',
        [HeadingEnum.PHILOSOPHICAL_BELIEFS]: '',
        [HeadingEnum.TRAVEL_EXPERIENCES]: '',
        [HeadingEnum.QUADRANTS]: '',
        [HeadingEnum.ELEMENTS]: '',
        [HeadingEnum.MODALITIES]: '',
        [HeadingEnum.PATTERN]: '',
        [HeadingEnum.SUN]: '',
        [HeadingEnum.MOON]: '',
        [HeadingEnum.ASCENDANT]: '',
        [HeadingEnum.MERCURY]: '',
        [HeadingEnum.VENUS]: '',
        [HeadingEnum.MARS]: '',
        [HeadingEnum.SATURN]: '',
        [HeadingEnum.JUPITER]: '',
        [HeadingEnum.URANUS]: '',
        [HeadingEnum.NEPTUNE]: '',
        [HeadingEnum.PLUTO]: ''
    },

    setSubHeadingsPromptDescriptionsMap: (key, description) => set(state => ({
        subHeadingsPromptDescriptionsMap: { ...state.subHeadingsPromptDescriptionsMap, [key]: description }
    })),
}));

export default useStore;

