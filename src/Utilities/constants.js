
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

  export const dominanceTopics = ['Quadrants', 'Elements', 'Modalities', 'Pattern']
  export const planets = ["Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars", "Saturn", "Jupiter", "Uranus", "Neptune", "Pluto"]  
  export const transitTopics = ['Progressed', 'Transits']

  export const HeadingEnum = {
    // Personality
    PERSONAL_IDENTITY: "Personal Identity and Self-Image",
    OUTWARD_EXPRESSION: "Outward Expression and Appearance",
    INNER_SELF: "Inner Self and Emotional Dynamics",
    CHALLENGES_TENSION: "Challenges and Tension",
    PATH_INTEGRATION: "Path of Integration",
  
    // Home
    EMOTIONAL_FOUNDATIONS: "Emotional Foundations and Security Needs",
    FAMILY_DYNAMICS: "Family Dynamics and Past Influences",
    HOME_ENVIRONMENT: "Home Environment and Preferences",
    FAMILY_CHALLENGES: "Challenges and Growth in Family Life",
    HARMONIOUS_HOME: "Synthesizing a Harmonious Physical and Emotional Home",
  
    // Relationships
    RELATIONSHIP_DESIRES: "Core Relationship Desires and Boundaries",
    LOVE_STYLE: "Love Style: Expression and Attraction",
    SEXUAL_NATURE: "Sexual Nature and Intimacy",
    COMMITMENT_APPROACH: "Commitment Approach and Long-term Vision",
    RELATIONSHIP_CHALLENGES: "Challenges and Growth in Relationships",
    ROMANTIC_SUMMARY: "Romantic Summary",
    SOCIAL_NETWORKS: "Social Networks and Community",
  
    // Career
    CAREER_MOTIVATIONS: "Career Motivations and Ambitions",
    PUBLIC_IMAGE: "Public Image, Reputation, and Leadership Style",
    CAREER_CHALLENGES: "Challenges and Growth Opportunities in Profession",
    SKILLS_TALENTS: "Skills, Talents, and Strengths",
    CAREER_SUMMARY: "Summary and Path To Success",
  
    // Unconscious
    PSYCHOLOGICAL_PATTERNS: "Deep Psychological Patterns",
    SPIRITUAL_GROWTH: "Spiritual Growth and Hidden Strengths",
    KARMIC_LESSONS: "Karmic Lessons and Past Life Influences",
    TRANSFORMATIVE_EVENTS: "Transformative Events and Personal Metamorphosis",
  
    // Communication
    COMMUNICATION_STYLES: "Communication and Learning Styles",
    PHILOSOPHICAL_BELIEFS: "Philosophical Beliefs and Higher Learning",
    TRAVEL_EXPERIENCES: "Travel and Cross-Cultural Experiences"
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

