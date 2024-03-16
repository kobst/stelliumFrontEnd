export const findSunMoonAspects = (codes) => {
    // Initialize an array to hold codes that indicate an aspect between the Sun and Moon
    let sunMoonAspects = [];
  
    // Iterate over each code in the array
    codes.forEach(code => {
      // Check if the code contains indicators for the Sun and Moon in aspect
      if (code.includes('pSu') && (code.includes('pMo') || code.includes('Mos'))) {
        sunMoonAspects.push(code);
      }
    });
  
    return sunMoonAspects;
  }
  

export const findEnteringLeavingTransits = (codes) => {
    // Initialize an array to hold codes indicating the Sun or Moon entering or leaving
    let transits = [];
  
    // Regular expression to match codes where the Sun or Moon is entering or leaving
    const pattern = /H[tr]-p(Su|Mo)[EL][es][^T]*T\d{2}/;
  
    // Iterate over each code in the array
    codes.forEach(code => {
      // Check if the code matches the pattern for entering or leaving
      if (pattern.test(code)) {
        transits.push(code);
      }
    });
  
    return transits;
  }