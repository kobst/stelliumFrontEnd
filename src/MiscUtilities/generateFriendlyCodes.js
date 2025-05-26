const fs = require('fs');

const data = require('../Utilities/descriptionLookup.json');

/**
 * Takes an object with descriptive codes as values and replaces them with a 6-digit incrementing number.
 * @param {Object} dict - The original dictionary with descriptive values.
 * @returns {Object} A new dictionary with the same keys but values replaced by 6-digit codes.
 */

function replaceWithSixDigitNumbers(dict) {
    let counter = 1; // Start counter from 1
    const updatedDict = {};

    for (const key in dict) {
        if (dict.hasOwnProperty(key)) {
            // Format the counter as a 6-digit string, padding with zeros as necessary
            const formattedNumber = counter.toString().padStart(6, '0');
            updatedDict[key] = formattedNumber;
            counter++; // Increment the counter for the next entry
        }
    }

    return updatedDict;
}

const updatedDict = replaceWithSixDigitNumbers(data);

// Optionally, write the updated dictionary to a new JSON file
const outputPath = './updatedDictionary.json';
fs.writeFileSync(outputPath, JSON.stringify(updatedDict, null, 2), 'utf-8');
console.log(`Updated dictionary has been written to ${outputPath}`);