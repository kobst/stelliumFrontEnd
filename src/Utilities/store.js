// store.js
import create from 'zustand';
import { HeadingEnum } from './constants';


const useStore = create(set => ({

    userData: null,
    setUserData: (data) => set({ userData: data }),


    userId: '',
    setUserId: (response) => set({ userId: response }),

    selectedUser: {},
    setSelectedUser: (response) => set({ selectedUser: response }),


  userPlanets: [],
  setUserPlanets: (response) => set({ userPlanets: response }),

  userHouses: [],
  setUserHouses: (response) => set({ userHouses: response }),

  userElements: {},
  setUserElements: (response) => set({ userElements: response }),

  userModalities: {},
  setUserModalities: (response) => set({ userModalities: response }),

  userQuadrants: {},
  setUserQuadrants: (response) => set({ userQuadrants: response }),

  userPatterns: {},
  setUserPatterns: (response) => set({ userPatterns: response }),

  userAspects: [],
  setUserAspects: (response) => set({ userAspects: response }),


  dailyTransits: [],
  setDailyTransits: (response) => set({dailyTransits: response}),



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

}));

export default useStore;

