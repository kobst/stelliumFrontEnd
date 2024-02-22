// missing 3, 8, 9, 11, 12

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
        // "Uranus"
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

  const personality_headings = ["Personal Identity and Self-Image", "Outward Expression and Appearance", "Inner Self and Emotional Dynamics", "Challenges and Tension", "Path of Integration"]
  
  const home_headings = ["Emotional Foundations and Security Needs", "Family Dynamics and Past Influences", "Home Environment and Preferences", "Challenges and Growth in Family Life", "Synthesizing a Harmonious Physical and Emotional Home"]
  
  const relationship_headings = ["Core Relationship Desires and Boundaries", "Love Style: Expression and Attraction", "Sexual Nature and Intimacy", "Commitment Approach and Long-term Vision", "Challenges and Growth in Relationships", "Romantic Summary", "Social Networks and Community"]
  
  const career_headings = ["Career Motivations and Ambitions", "Public Image, Reputation, and Leadership Style", "Challenges and Growth Opportunities in Profession", "Skills, Talents, and Strengths", "Summary and Path To Success"]

  const unconscious_headings = ["Deep Psychological Patterns", "Spiritual Growth and Hidden Strengths", "Karmic Lessons and Past Life Influences", "Transformative Events and Personal Metamorphosis"]

  const communication_headings = ["Communication and Learning Styles", "Philosophical Beliefs and Higher Learning", "Travel and Cross-Cultural Experiences"]
  
  export const heading_map = {
    "personality": personality_headings,
    "home": home_headings,
    "relationships": relationship_headings,
    "career": career_headings,
    "unconscious": unconscious_headings,
    "communication": communication_headings,
    "everything": personality_headings,

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
    "Sun": "00",
    "Moon": "01",
    "Mercury": "02",
    "Venus": "03",
    "Mars": "04",
    "Jupiter": "05",
    "Saturn": "06",
    "Uranus": "07",
    "Neptune": "08",
    "Pluto": "09",
    "Ascendant": "10",
    "Midheaven": "11",
    "Node": "12",
    "South Node": "13",
    "Chiron": "14",
    "Part of Fortune": "15"
  }

  export const signCodes = {
    "Aries": "01",
    "Taurus": "02",
    "Gemini": "03",
    "Cancer": "04",
    "Leo": "05",
    "Virgo": "06",
    "Libra": "07",
    "Scorpio": "08",
    "Sagittarius": "09",
    "Capricorn": "10",
    "Aquarius": "11",
    "Pisces": "12"
  }

export const transitCodes = {
    "conjunction": "A1",
    "sextile": "A2",
    "square": "A3",
    "trine": "A4",
    "opposition": "A5",
    "quincunx": "A6"
  }

  export const orbCodes = {
    "loose": "L",
    "close": "C",
    "exact": "E",
    "": "G",
  }
