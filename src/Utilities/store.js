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

    // User context management for dashboard
    currentUserContext: null, // The account owner (original user)
    setCurrentUserContext: (user) => set({ currentUserContext: user }),
    
    activeUserContext: null, // Currently viewed user (could be owner or guest)
    setActiveUserContext: (user) => set({ activeUserContext: user }),
    
    previousUserContext: null, // For breadcrumb navigation
    setPreviousUserContext: (user) => set({ previousUserContext: user }),

    // Helper function to switch user context
    switchUserContext: (newUser) => set(state => {
        // Store current active user as previous for breadcrumb
        const previousUser = state.activeUserContext;
        
        return {
            previousUserContext: previousUser,
            activeUserContext: newUser,
            selectedUser: newUser,
            userId: newUser._id,
            userPlanets: newUser.birthChart?.planets || [],
            userHouses: newUser.birthChart?.houses || [],
            userAspects: newUser.birthChart?.aspects || [],
            userElements: newUser.birthChart?.elements || {},
            userModalities: newUser.birthChart?.modalities || {},
            userQuadrants: newUser.birthChart?.quadrants || {},
            userPatterns: newUser.birthChart?.patterns || {}
        };
    }),

    // Helper function to return to account owner context
    returnToOwnerContext: () => set(state => {
        const owner = state.currentUserContext;
        if (!owner) return state;

        return {
            previousUserContext: null,
            activeUserContext: owner,
            selectedUser: owner,
            userId: owner._id,
            userPlanets: owner.birthChart?.planets || [],
            userHouses: owner.birthChart?.houses || [],
            userAspects: owner.birthChart?.aspects || [],
            userElements: owner.birthChart?.elements || {},
            userModalities: owner.birthChart?.modalities || {},
            userQuadrants: owner.birthChart?.quadrants || {},
            userPatterns: owner.birthChart?.patterns || {}
        };
    }),

    // Helper function to check if currently viewing account owner
    isViewingOwner: () => {
        const state = useStore.getState();
        return state.currentUserContext && state.activeUserContext && 
               state.currentUserContext._id === state.activeUserContext._id;
    },

}));

export default useStore;

