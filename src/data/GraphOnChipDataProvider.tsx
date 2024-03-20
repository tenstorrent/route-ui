import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import GraphOnChip from './GraphOnChip';
import type { GraphRelationshipState } from './StateTypes';

interface ChipsState {
    graphName: string;
    chips: {
        [graphName: string]: GraphOnChip;
    };
    graphs: Map<string, GraphRelationshipState>;
}

interface ChipContextType {
    chipState: ChipsState;
    loadGraphOnChips: (newChips: GraphOnChip[], graphs: GraphRelationshipState[]) => void;
    resetChips: () => void;
    getAvailableGraphs: () => GraphRelationshipState[];
    getActiveGraph: () => GraphRelationshipState | undefined;
    getActiveChip: () => GraphOnChip | undefined;
    setActiveChip: (graphName: string) => void;
    getChipByGraphName: (graphName: string) => GraphOnChip | undefined;
    getGraphName: () => string;
}

const initialChipsState: ChipsState = {
    graphName: '',
    chips: {},
    graphs: new Map<string, GraphRelationshipState>(),
};

const GraphOnChipContext = createContext<ChipContextType>({
    chipState: initialChipsState,
    loadGraphOnChips: () => {},
    resetChips: () => {},
    getAvailableGraphs: () => [],
    getActiveGraph: () => undefined,
    getActiveChip: () => undefined,
    setActiveChip: () => {},
    getChipByGraphName: () => undefined,
    getGraphName: () => '',
});

const GraphOnChipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chipsState, setChipsState] = useState<ChipsState>(initialChipsState);

    const setChips = useCallback((newChips: GraphOnChip[], graphs: GraphRelationshipState[]) => {
        setChipsState({
            graphName: '',
            chips: Object.fromEntries(newChips.map((chip, index) => [graphs[index].name, chip])),
            graphs: new Map(graphs.map((graph) => [graph.name, graph])),
        });
    }, []);

    const getChipByGraphName = useCallback(
        (graphName: string) => {
            return chipsState.chips[graphName];
        },
        [chipsState.chips],
    );

    const resetChips = useCallback(() => {
        setChipsState({ ...initialChipsState, graphs: new Map() });
    }, []);

    const getAvailableGraphs = useCallback(() => {
        return [...chipsState.graphs.values()];
    }, [chipsState]);



    const getActiveGraph = useCallback(() => {
        return chipsState.graphs.get(chipsState.graphName);
    }, [chipsState]);

    const getActiveChip = useCallback(() => {
        return chipsState.chips[chipsState.graphName];
    }, [chipsState]);

    const setActiveChip = useCallback((graphName: string) => {
        setChipsState((prevState) => ({
            ...prevState,
            graphName,
        }));
    }, []);

    const getGraphName = useCallback(() => {
        return chipsState.graphName;
    }, [chipsState.graphName]);

    const value = useMemo<ChipContextType>(
        () => ({
            loadGraphOnChips: setChips,
            chipState: chipsState,
            getActiveChip,
            getActiveGraph,
            getAvailableGraphs,
            getChipByGraphName,
            getGraphName,
            resetChips,
            setActiveChip,
        }),
        [
            setChips,
            chipsState,
            getActiveChip,
            getActiveGraph,
            getAvailableGraphs,
            getChipByGraphName,
            getGraphName,
            resetChips,
            setActiveChip,
        ],
    );

    return <GraphOnChipContext.Provider value={value}>{children}</GraphOnChipContext.Provider>;
};

export { GraphOnChipContext, GraphOnChipProvider };
