/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

const serviceURI = "http://localhost:3000"

export function parseEndpoint(
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