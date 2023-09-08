import React, {createContext} from 'react';
import GridData from './DataStructures';
import {NetlistAnalyzerDataJSON} from './JSONDataTypes';

export interface GridContext {
    gridData: GridData | null;
    setGridData: (data: GridData) => void;
}

const DataSource: React.Context<GridContext> = createContext<GridContext>({
    // @ts-ignore
    gridData: new GridData(<NetlistAnalyzerDataJSON>{nodes: []}),
    setGridData: () => {
        throw Error('Not implemented');
    },
});

export default DataSource;
