import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import GraphOnChip from './GraphOnChip';
import type { GraphRelationship } from './StateTypes';

interface ChipsState {
    activeGraphName: string;
    chips: {
        [graphName: string]: GraphOnChip;
    };
    graphs: Map<string, GraphRelationship>;
}

interface GraphOnChipContextType {
    chipState: ChipsState;
    loadGraphOnChips: (newChips: GraphOnChip[], graphs: GraphRelationship[]) => void;
    resetGraphOnChipState: () => void;
    getGraphRelationshipList: () => GraphRelationship[];
    getActiveGraphRelationship: () => GraphRelationship | undefined;
    getActiveGraphOnChip: () => GraphOnChip | undefined;
    setActiveGraph: (graphName: string) => void;
    getGraphOnChip: (graphName: string) => GraphOnChip | undefined;
    getActiveGraphName: () => string;
}

const initialChipsState: ChipsState = {
    activeGraphName: '',
    chips: {},
    graphs: new Map<string, GraphRelationship>(),
};

const GraphOnChipContext = createContext<GraphOnChipContextType>({
    chipState: initialChipsState,
    loadGraphOnChips: () => {},
    resetGraphOnChipState: () => {},
    getGraphRelationshipList: () => [],
    getActiveGraphRelationship: () => undefined,
    getActiveGraphOnChip: () => undefined,
    setActiveGraph: () => {},
    getGraphOnChip: () => undefined,
    getActiveGraphName: () => '',
});

const GraphOnChipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chipsState, setChipsState] = useState<ChipsState>(initialChipsState);

    const loadGraphOnChips = useCallback((newChips: GraphOnChip[], graphs: GraphRelationship[]) => {
        setChipsState({
            activeGraphName: '',
            chips: Object.fromEntries(newChips.map((chip, index) => [graphs[index].name, chip])),
            graphs: new Map(graphs.map((graph) => [graph.name, graph])),
        });
    }, []);

    const getGraphOnChip = useCallback(
        (graphName: string) => {
            return chipsState.chips[graphName];
        },
        [chipsState.chips],
    );

    const reset = useCallback(() => {
        setChipsState({ ...initialChipsState, graphs: new Map() });
    }, []);

    const getGraphRelationshipList = useCallback(() => {
        return [...chipsState.graphs.values()];
    }, [chipsState]);

    const getActiveGraphRelationship = useCallback(() => {
        return chipsState.graphs.get(chipsState.activeGraphName);
    }, [chipsState]);

    const getActiveGraphOnChip = useCallback(() => {
        return chipsState.chips[chipsState.activeGraphName];
    }, [chipsState]);

    const setActiveGraph = useCallback((graphName: string) => {
        setChipsState((prevState) => ({
            ...prevState,
            activeGraphName: graphName,
        }));
    }, []);

    const getActiveGraphName = useCallback(() => {
        return chipsState.activeGraphName;
    }, [chipsState.activeGraphName]);

    const value = useMemo<GraphOnChipContextType>(
        () => ({
            loadGraphOnChips,
            chipState: chipsState,
            getActiveGraphOnChip,
            getActiveGraphRelationship,
            getGraphRelationshipList,
            getGraphOnChip,
            getActiveGraphName,
            resetGraphOnChipState: reset,
            setActiveGraph,
        }),
        [
            loadGraphOnChips,
            chipsState,
            getActiveGraphOnChip,
            getActiveGraphRelationship,
            getGraphRelationshipList,
            getGraphOnChip,
            getActiveGraphName,
            reset,
            setActiveGraph,
        ],
    );

    return <GraphOnChipContext.Provider value={value}>{children}</GraphOnChipContext.Provider>;
};

export { GraphOnChipContext, GraphOnChipProvider };
