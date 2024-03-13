import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import Chip from './Chip';
import type { GraphRelationshipState } from './StateTypes';

interface ChipsState {
    graphName: string;
    chips: {
        [chipId: string]: Chip;
    };
}

interface ChipContextType {
    chipState: ChipsState;
    addChip: (newChip: Chip, graphName: string) => void;
    resetChips: () => void;
    setGraphName: (graphName: string) => void;
    getAvailableGraphs: () => GraphRelationshipState[];
    getActiveChip: () => Chip | undefined;
    setActiveChip: (graphName: string) => void;
    getChipByGraphName: (graphName: string) => Chip | undefined;
    getGraphName: () => string;
}

const initialChipsState: ChipsState = {
    graphName: '',
    chips: {},
};

// TODO: pull from latest cluster view changes
// TODO: make graph name, architecture and temporal epoch available as properties
const ChipContext = createContext<ChipContextType>({
    chipState: initialChipsState,
    addChip: () => {},
    resetChips: () => {},
    setGraphName: () => {},
    getAvailableGraphs: () => [],
    getActiveChip: () => undefined,
    setActiveChip: () => {},
    getChipByGraphName: () => undefined,
    getGraphName: () => '',
});

const ChipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chipsState, setChipsState] = useState<ChipsState>(initialChipsState);

    const addChip = useCallback((newChipData: Chip, graphName: string) => {
        setChipsState((prevState) => ({
            ...prevState,
            chips: {
                ...prevState.chips,
                [graphName]: newChipData,
            },
        }));
    }, []);

    const getChipByGraphName = useCallback(
        (graphName: string) => {
            return chipsState.chips[graphName];
        },
        [chipsState.chips],
    );

    const resetChips = useCallback(() => {
        setChipsState(initialChipsState);
    }, []);

    const setGraphName = useCallback((graphName: string) => {
        setChipsState((prevState) => ({
            ...prevState,
            graphName,
        }));
    }, []);

    // TODO: create function for getting graph names
    // TODO: create function to get graph architecture, chip id and temporal epochs list
    const getAvailableGraphs = useCallback(() => {
        return Object.entries(chipsState.chips).map(([key, value]) => ({
            name: key,
            architecture: value.architecture,
            chipId: value.chipId,
        }));
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
            chipState: chipsState,
            addChip,
            resetChips,
            setGraphName,
            getAvailableGraphs,
            getActiveChip,
            setActiveChip,
            getChipByGraphName,
            getGraphName,
        }),
        [chipsState, addChip, resetChips, setGraphName, getActiveChip, setActiveChip, getChipByGraphName, getGraphName],
    );

    return <ChipContext.Provider value={value}>{children}</ChipContext.Provider>;
};

export { ChipContext, ChipProvider };
