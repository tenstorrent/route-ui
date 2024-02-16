import React, { createContext } from 'react';
import Cluster from './Cluster';

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
