import React, { createContext } from 'react';
import Cluster from './Cluster';

export interface ClusterModel {
    cluster: Cluster | null;
    setCluster: (data: Cluster | null) => void;
}

export const ClusterContext: React.Context<ClusterModel> = createContext<ClusterModel>({
    // @ts-expect-error
    cluster: new Cluster(),
    setCluster: () => {
        throw Error('Not implemented');
    },
});
