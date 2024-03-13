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

const ChipContext = createContext<ChipContextType>({
    chipState: initialChipsState,
    addChip: () => {},
    resetChips: () => {},
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

    // TODO: create function to get graph architecture, chip id and temporal epochs list
    const getAvailableGraphs = useCallback(() => {
        return Object.entries(chipsState.chips).map(([graphName, chip]) => ({
            name: graphName,
            architecture: chip.architecture,
            chipId: chip.chipId,
            temporalEpoch: chip?.temporalEpoch ?? 0,
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
            getAvailableGraphs,
            getActiveChip,
            setActiveChip,
            getChipByGraphName,
            getGraphName,
        }),
        [
            chipsState,
            addChip,
            resetChips,
            getActiveChip,
            setActiveChip,
            getChipByGraphName,
            getGraphName,
            getAvailableGraphs,
        ],
    );

    return <ChipContext.Provider value={value}>{children}</ChipContext.Provider>;
};

export { ChipContext, ChipProvider };
