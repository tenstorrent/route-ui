import React, { createContext } from 'react';
import Chip from './Chip';
import { NetlistAnalyzerDataJSON } from './JSONDataTypes';
import Cluster from './Cluster';

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

export interface ClusterContext {
    cluster: Cluster | null;
    setCluster: (data: Cluster | null) => void;
}

export const ClusterDataSource: React.Context<ClusterContext> = createContext<ClusterContext>({
    // @ts-ignore
    cluster: new Cluster(),
    setCluster: () => {
        throw Error('Not implemented');
    },
});
