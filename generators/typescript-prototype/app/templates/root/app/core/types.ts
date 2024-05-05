import {Command} from '@event-driven-io/emmett';
import React from 'react';

export type CommandConfig = {
    command: string
    handler: (command:any)=>any,
    schema: any // json schema
}

export type ViewSelection = {
    "slice" : string,
    "view" : React.FC<any>,
    "viewName":string
}
