/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

const serviceURI = "http://localhost:3000"

export function parseEndpoint(endpoint:string, data?:any) {
    var parsedEndpoint = endpoint?.startsWith("/") ? endpoint.substring(1) : endpoint
    return serviceURI + "/" + lowercaseFirstCharacter(parsedEndpoint).replace(/{(\w+)}/g, (match, param) => {
        return param && data && data[param] !== undefined ? data[param] : match;
    })
}


export function parseQueryEndpoint(
    endpoint: string,
    queries?: Record<string, string>
) {
    const parsedEndpoint = endpoint.startsWith("/")
        ? endpoint.substring(1)
        : endpoint;

    const basePath =
        serviceURI + "/api/query/" + parsedEndpoint;

    const queryString = queries
        ? "?" + new URLSearchParams(filterEmptyEntries(queries)).toString()
        : "";

    return basePath + queryString;
}

function filterEmptyEntries(queries?: Record<string, string>): Record<string, string> {
    if (!queries) return {};
    return Object.fromEntries(
        Object.entries(queries).filter(([key, value]) => value !== "")
    );
}



function lowercaseFirstCharacter(inputString:string) {
    // Check if the string is not empty
    if (inputString?.length > 0) {
        // Capitalize the first character and concatenate the rest of the string
        return inputString.charAt(0).toLowerCase() + inputString.substring(1);
    } else {
        // Return an empty string if the input is empty
        return "";
    }
}