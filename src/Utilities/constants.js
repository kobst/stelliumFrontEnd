
export const relevantPromptAspects = {
    "personality": {
      "planets": ["Sun", "Moon", "Ascendant"],
      "houses": [1]
    },
    "relationships": {
      "planets": [
        "Sun",
        "Moon",
        "Venus",
        "Mars",
        "Ascendant",
      ],
      "houses": [5, 7, 11]
    },
    "career": {
      "planets": ["Sun", "Saturn", "Jupiter", "Midheaven", "Part of Fortune"],
      "houses": [2, 6, 10]
    },
    "home": {
      "planets": ["Sun", "Moon", "Saturn"],
      "houses": [4]
    },
    "unconscious": {
      "planets": ["Pluto", "Neptune", "Mars", "Node", "South Node", "Chiron"],
      "houses": [8, 12]
    },
    "communication": {
      "planets": ["Sun", "Moon", "Ascendant", "Mercury", "Jupiter"],
      "houses": [3, 9]
    },
    "everything": {
      "planets": [
        "Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars", "Saturn",
        "Jupiter", "Uranus", "Neptune", "Pluto", "Part of Fortune", "Node",
        "South Node"
      ],
      "houses": [1, 4, 7, 10]
    }
  }
  
export const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ]
  
export const rulers = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Uranus",
    "Pisces": "Neptune"
  }

  // export const DominanceEnum = {
  //   QUADRANTS: "Quadrants",
  //   ELEMENTS: "Elements",
  //   MODALITIES: "Modalities",
  //   PATTERN: "Pattern"
  // }
  // export const dominanceTopics = [DominanceEnum.QUADRANTS, DominanceEnum.ELEMENTS, DominanceEnum.MODALITIES, DominanceEnum.PATTERN]

  export const transitTopics = ['Progressed', 'Transits']


  export const PlanetEnum = {
    SUN: "Sun",
    MOON: "Moon",
    ASCENDANT: "Ascendant",
    MERCURY: "Mercury",
    VENUS: "Venus",
    MARS: "Mars",
    SATURN: "Saturn",
    JUPITER: "Jupiter",
    URANUS: "Uranus",
    NEPTUNE: "Neptune",
    PLUTO: "Pluto"
  }

  export const planets = [
    PlanetEnum.SUN,
    PlanetEnum.MOON,
    PlanetEnum.ASCENDANT,
    PlanetEnum.MERCURY,
    PlanetEnum.VENUS,
    PlanetEnum.MARS,
    PlanetEnum.SATURN,
    PlanetEnum.JUPITER,
    PlanetEnum.URANUS,
    PlanetEnum.NEPTUNE,
    PlanetEnum.PLUTO
  ]  


  export const HeadingEnum = {
    // Personality
    PERSONAL_IDENTITY: "Personal_Identity_and_Self-Image",
    OUTWARD_EXPRESSION: "Outward_Expression_and_Appearance",
    INNER_SELF: "Inner_Self_and_Emotional_Dynamics",
    CHALLENGES_TENSION: "Challenges_and_Tension",
    PATH_INTEGRATION: "Path_of_Integration",
  
    // Home
    EMOTIONAL_FOUNDATIONS: "Emotional_Foundations_and_Security_Needs",
    FAMILY_DYNAMICS: "Family_Dynamics_and_Past_Influences",
    HOME_ENVIRONMENT: "Home_Environment_and_Preferences",
    FAMILY_CHALLENGES: "Challenges_and_Growth_in_Family_Life",
    HARMONIOUS_HOME: "Synthesizing_a_Harmonious_Physical_and_Emotional_Home",
  
    // Relationships
    RELATIONSHIP_DESIRES: "Core_Relationship_Desires_and_Boundaries",
    LOVE_STYLE: "Love_Style:_Expression_and_Attraction",
    SEXUAL_NATURE: "Sexual_Nature_and_Intimacy",
    COMMITMENT_APPROACH: "Commitment_Approach_and_Long-term_Vision",
    RELATIONSHIP_CHALLENGES: "Challenges_and_Growth_in_Relationships",
    ROMANTIC_SUMMARY: "Romantic_Summary",
    SOCIAL_NETWORKS: "Social_Networks_and_Community",
  
    // Career
    CAREER_MOTIVATIONS: "Career_Motivations_and_Ambitions",
    PUBLIC_IMAGE: "Public_Image,_Reputation,_and_Leadership_Style",
    CAREER_CHALLENGES: "Challenges_and_Growth_Opportunities_in_Profession",
    SKILLS_TALENTS: "Skills,_Talents,_and_Strengths",
    CAREER_SUMMARY: "Summary_and_Path_To_Success",
  
    // Unconscious
    PSYCHOLOGICAL_PATTERNS: "Deep_Psychological_Patterns",
    SPIRITUAL_GROWTH: "Spiritual_Growth_and_Hidden_Strengths",
    KARMIC_LESSONS: "Karmic_Lessons_and_Past_Life_Influences",
    TRANSFORMATIVE_EVENTS: "Transformative_Events_and_Personal_Metamorphosis",
  
    // Communication
    COMMUNICATION_STYLES: "Communication_and_Learning_Styles",
    PHILOSOPHICAL_BELIEFS: "Philosophical_Beliefs_and_Higher_Learning",
    TRAVEL_EXPERIENCES: "Travel_and_Cross-Cultural_Experiences",

    // Dominance
    QUADRANTS: "Quadrants",
    ELEMENTS: "Elements",
    MODALITIES: "Modalities",
    PATTERN: "Pattern",

    // Planets
    SUN: "Sun",
    MOON: "Moon",
    ASCENDANT: "Ascendant",
    MERCURY: "Mercury",
    VENUS: "Venus",
    MARS: "Mars",
    SATURN: "Saturn",
    JUPITER: "Jupiter",
    URANUS: "Uranus",
    NEPTUNE: "Neptune",
    PLUTO: "Pluto"
  };
  
  const personality_headings = [
    HeadingEnum.PERSONAL_IDENTITY,
    HeadingEnum.OUTWARD_EXPRESSION,
    HeadingEnum.INNER_SELF,
    HeadingEnum.CHALLENGES_TENSION,
    HeadingEnum.PATH_INTEGRATION
  ];
  
  const home_headings = [
    HeadingEnum.EMOTIONAL_FOUNDATIONS,
    HeadingEnum.FAMILY_DYNAMICS,
    HeadingEnum.HOME_ENVIRONMENT,
    HeadingEnum.FAMILY_CHALLENGES,
    HeadingEnum.HARMONIOUS_HOME
  ];
  
  const relationship_headings = [
    HeadingEnum.RELATIONSHIP_DESIRES,
    HeadingEnum.LOVE_STYLE,
    HeadingEnum.SEXUAL_NATURE,
    HeadingEnum.COMMITMENT_APPROACH,
    HeadingEnum.RELATIONSHIP_CHALLENGES,
    HeadingEnum.ROMANTIC_SUMMARY,
    HeadingEnum.SOCIAL_NETWORKS
  ];
  
  const career_headings = [
    HeadingEnum.CAREER_MOTIVATIONS,
    HeadingEnum.PUBLIC_IMAGE,
    HeadingEnum.CAREER_CHALLENGES,
    HeadingEnum.SKILLS_TALENTS,
    HeadingEnum.CAREER_SUMMARY
  ];
  
  const unconscious_headings = [
    HeadingEnum.PSYCHOLOGICAL_PATTERNS,
    HeadingEnum.SPIRITUAL_GROWTH,
    HeadingEnum.KARMIC_LESSONS,
    HeadingEnum.TRANSFORMATIVE_EVENTS
  ];
  
  const communication_headings = [
    HeadingEnum.COMMUNICATION_STYLES,
    HeadingEnum.PHILOSOPHICAL_BELIEFS,
    HeadingEnum.TRAVEL_EXPERIENCES
  ];

  export const dominance_headings = [
    HeadingEnum.QUADRANTS,
    HeadingEnum.ELEMENTS,
    HeadingEnum.MODALITIES,
    HeadingEnum.PATTERN
  ];

  export const planet_headings = [
    HeadingEnum.SUN,
    HeadingEnum.MOON,
    HeadingEnum.ASCENDANT,
    HeadingEnum.MERCURY,
    HeadingEnum.VENUS,
    HeadingEnum.MARS,
    HeadingEnum.SATURN,
    HeadingEnum.JUPITER,
    HeadingEnum.URANUS,
    HeadingEnum.NEPTUNE,
    HeadingEnum.PLUTO
  ]
  
export const heading_map = {
  "personality": personality_headings,
  "home": home_headings,
  "relationships": relationship_headings,
  "career": career_headings,
  "unconscious": unconscious_headings,
  "communication": communication_headings,
}

export const elements = {
  'Fire': ["Leo", "Aries", "Sagittarius"],
  'Earth': ["Taurus", "Virgo", "Capricorn"],
  'Air': ["Gemini", "Libra", "Aquarius"],
  'Water': ["Cancer", "Scorpio", "Pisces"]
}

export const elementPoints = {
  "Sun": 3,
  "Moon": 3,
  "Ascendant": 3,
  "Mercury": 2,
  "Venus": 2,
  "Mars": 2,
  "Saturn": 2,
  "Jupiter": 2,
  "Uranus": 1,
  "Neptune": 1,
  "Pluto": 1,
  "Node": 1,
  "Midheaven": 1
}

export const quadrants = {
  'SouthEast': [10, 11, 12],
  "NorthEast": [1, 2, 3],
  "NorthWest": [4, 5, 6],
  "SouthWest": [7, 8, 9]
}

export const modalities = {
  'Cardinal': ["Aries", "Cancer", "Libra", "Capricorn"],
  'Fixed': ["Taurus", "Leo", "Scorpio", "Aquarius"],
  'Mutable': ["Gemini", "Virgo", "Sagittarius", "Pisces"]
}

export const ignorePlanets = [
  "Ascendant", "Midheaven", "Chiron", "Part of Fortune", "South Node", "Node"
]
export const ignorePoints = ["Chiron", "Part of Fortune", "South Node"]

export const planetCodes = {
  "Sun": "pSu",
  "Moon": "pMo",
  "Mercury": "pMe",
  "Venus": "pVe",
  "Mars": "pMa",
  "Jupiter": "pJu",
  "Saturn": "pSa",
  "Uranus": "pUr",
  "Neptune": "pNe",
  "Pluto": "pPl",
  "Ascendant": "pAs",
  "Midheaven": "pMi",
  "Node": "pNo",
  "South Node": "pSo",
  "Chiron": "pCh",
  "Part of Fortune": "pPa"
}

  export const signCodes = {
    "Aries": "sAr",
    "Taurus": "sTa",
    "Gemini": "sGe",
    "Cancer": "sCa",
    "Leo": "sLe",
    "Virgo": "sVi",
    "Libra": "sLi",
    "Scorpio": "sSc",
    "Sagittarius": "sSa",
    "Capricorn": "sCp",
    "Aquarius": "sAq",
    "Pisces": "sPi"
  }

export const transitCodes = {
    "conjunction": "aCo",
    "sextile": "aSe",
    "square": "aSq",
    "trine": "aTr",
    "opposition": "aOp",
    "quincunx": "aQu"
  }

  export const orbCodes = {
    "loose": "L",
    "close": "C",
    "exact": "E",
    "": "G",
  }

  export const chart = {
    "natal": "Na-",
    "progressed": "Pg-",
    "transiting": "Tr-"
  }

