/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

const groupBy = function groupBy(array, callback) {
    return array.reduce((acc, currentValue) => {
        const key = callback(currentValue);

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(currentValue);

        return acc;
    }, {});
}

function capitalizeFirstCharacter(inputString) {
    // Check if the string is not empty
    if (inputString?.length > 0) {
        // Capitalize the first character and concatenate the rest of the string
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    } else {
        // Return an empty string if the input is empty
        return "";
    }
}

function camelCaseToUnderscores(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function lowercaseFirstCharacter(inputString) {
    // Check if the string is not empty
    if (inputString?.length > 0) {
        // Capitalize the first character and concatenate the rest of the string
        return inputString.charAt(0).toLowerCase() + inputString.slice(1);
    } else {
        // Return an empty string if the input is empty
        return "";
    }
}

function uniq(array) {
    return array.filter((value, index, self) => self.indexOf(value) === index);
}

function uniqBy(array, keyFunc) {
    const seen = new Set();
    return array.filter(item => {
        const value = keyFunc(item);
        if (seen.has(value)) {
            return false;
        } else {
            seen.add(value);
            return true;
        }
    });
}

/**
 * sorted array is a string[] typically.
 * objects-array is sorted same as 'sortedArray' based on 'prop'
 *
 * objects[0][prop] should result in a value contained in sortedArray
 */
function sortBy(sortedArray, objects, prop) {
    var indexAr = []
    sortedArray.forEach((value, index) => {
        indexAr[value] = index;
    });

    objects.sort((a, b) => {
        return indexAr[a[prop]] - indexAr[b[prop]];
    });


}

function splitByCamelCase(str) {
    // Insert a space before each uppercase letter (except the first letter)
    str = str.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize the first letter of each word
    str = str.replace(/\b\w/g, char => char.toUpperCase());

    return str.trim();
}

function idField(element) {
    return element.fields?.find(it => it.idAttribute)?.name ?? "aggregateId"
}

module.exports = {
    groupBy,
    capitalizeFirstCharacter,
    lowercaseFirstCharacter,
    uniq,
    uniqBy,
    camelCaseToUnderscores,
    splitByCamelCase,
    idField
}
