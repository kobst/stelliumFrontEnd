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
      "houses": [5, 7]
    },
    "career": {
      "planets": ["Sun", "Saturn", "Jupiter", "Midheaven"],
      "houses": [2, 6, 10]
    },
    "home": {
      "planets": ["Moon", "Saturn"],
      "houses": [4]
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

  export const planets = ["Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars", "Saturn", "Jupiter", "Uranus", "Neptune", "Pluto"]  
  
  const personality_headings = ["Personal Identity and Self-Image", "Outward Expression and Appearance", "Inner Self and Emotional Dynamics", "Challenges and Tension", "Path of Integration"]
  
  const home_headings = ["Emotional Foundations and Security Needs", "Family Dynamics and Past Influences", "Home Environment and Preferences", "Challenges and Growth in Family Life", "Role of Tradition and Legacy", "Synthesizing a Harmonious Physical and Emotional Home"]
  
  const relationship_headings = ["Core Relationship Desires and Boundaries", "Love Style: Expression and Attraction", "Sexual Nature and Intimacy", "Commitment Approach and Long-term Vision", "Challenges and Growth in Relationships", "Romantic Summary"]
  
  const career_headings = ["Career Motivations and Ambitions", "Public Image, Reputation, and Leadership Style", "Challenges and Growth Opportunities in Profession", "Skills, Talents, and Strengths", "Summary and Path To Success"]

  export const heading_map = {
    "personality": personality_headings,
    "home": home_headings,
    "relationships": relationship_headings,
    "career": career_headings
  }