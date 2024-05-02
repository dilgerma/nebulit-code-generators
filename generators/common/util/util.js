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

module.exports = {groupBy, capitalizeFirstCharacter,lowercaseFirstCharacter, uniq, uniqBy}
