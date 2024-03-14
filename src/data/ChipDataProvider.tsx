import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import Chip from './Chip';
import type { GraphRelationshipState } from './StateTypes';

interface ChipsState {
    graphName: string;
    chips: {
        [graphName: string]: Chip;
    };
    graphs: Map<string, GraphRelationshipState>;
}

interface ChipContextType {
    chipState: ChipsState;
    addChip: (newChip: Chip, graph: GraphRelationshipState) => void;
    resetChips: () => void;
    getAvailableGraphs: () => GraphRelationshipState[];
    setAvailbaleGraphs: (graphs: GraphRelationshipState[]) => void;
    getActiveGraph: () => GraphRelationshipState | undefined;
    getActiveChip: () => Chip | undefined;
    setActiveChip: (graphName: string) => void;
    getChipByGraphName: (graphName: string) => Chip | undefined;
    getGraphName: () => string;
}

const initialChipsState: ChipsState = {
    graphName: '',
    chips: {},
    graphs: new Map<string, GraphRelationshipState>(),
};

const ChipContext = createContext<ChipContextType>({
    chipState: initialChipsState,
    addChip: () => {},
    resetChips: () => {},
    getAvailableGraphs: () => [],
    setAvailbaleGraphs: () => {},
    getActiveGraph: () => undefined,
    getActiveChip: () => undefined,
    setActiveChip: () => {},
    getChipByGraphName: () => undefined,
    getGraphName: () => '',
});

const ChipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chipsState, setChipsState] = useState<ChipsState>(initialChipsState);

    const addChip = useCallback((newChipData: Chip, graph: GraphRelationshipState) => {
        setChipsState((prevState) => {
            const graphs = new Map(prevState.graphs);

            graphs.set(graph.name, graph);

            return {
                ...prevState,
                chips: {
                    ...prevState.chips,
                    [graph.name]: newChipData,
                },
                graphs,
            };
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

    const setAvailbaleGraphs = useCallback((graphs: GraphRelationshipState[]) => {
        setChipsState((prevState) => ({
            ...prevState,
            graphs: new Map(graphs.map((graph) => [graph.name, graph])),
        }));
    }, []);

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
            addChip,
            chipState: chipsState,
            getActiveChip,
            getActiveGraph,
            getAvailableGraphs,
            getChipByGraphName,
            getGraphName,
            resetChips,
            setActiveChip,
            setAvailbaleGraphs,
        }),
        [
            addChip,
            chipsState,
            getActiveChip,
            getActiveGraph,
            getAvailableGraphs,
            getChipByGraphName,
            getGraphName,
            resetChips,
            setActiveChip,
            setAvailbaleGraphs,
        ],
    );

    return <ChipContext.Provider value={value}>{children}</ChipContext.Provider>;
};

export { ChipContext, ChipProvider };
