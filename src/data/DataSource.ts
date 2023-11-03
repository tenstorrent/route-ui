import React, { createContext } from 'react';
import Chip from './Chip';
import { NetlistAnalyzerDataJSON } from './JSONDataTypes';

export interface GridContext {
    chip: Chip | null;
    setChip: (data: Chip) => void;
}

const DataSource: React.Context<GridContext> = createContext<GridContext>({
    // @ts-ignore
    chip: new Chip(<NetlistAnalyzerDataJSON>{ nodes: [] }),
    setChip: () => {
        throw Error('Not implemented');
    },
});

export default DataSource;
