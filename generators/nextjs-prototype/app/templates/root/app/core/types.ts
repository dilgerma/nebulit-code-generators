import React from 'react';

export type CommandConfig = {
    command: string
    endpoint: string,
    schema: any // json schema
}

export type ReadModelConfig = {
    readModel: string
    endpoint: string,
    readModelView: React.FC<any>,
}

export type ViewSelection = {
    "slice" : string,
    "viewType": string,
    "commandView" : React.FC<any>,
    "viewName":string
}

