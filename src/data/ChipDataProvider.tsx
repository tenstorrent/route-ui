import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import Chip from './Chip';

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
    getActiveChip: () => Chip | undefined;
    setActiveChip: (graphName: string) => void;
    getChipByGraphName: (graphName: string) => Chip | undefined;
}

const initialChipsState: ChipsState = {
    graphName: '',
    chips: {},
};

const ChipContext = createContext<ChipContextType>({
    chipState: initialChipsState,
    addChip: () => {},
    resetChips: () => {},
    setGraphName: () => {},
    getActiveChip: () => undefined,
    setActiveChip: () => {},
    getChipByGraphName: () => undefined,
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

    const getChipByGraphName = useCallback((graphName: string) => {
        return chipsState.chips[graphName];
    }, [chipsState.chips]);

    const resetChips = useCallback(() => {
        setChipsState(initialChipsState);
    }, []);

    const setGraphName = useCallback((graphName: string) => {
        setChipsState((prevState) => ({
            ...prevState,
            graphName,
        }));
    }, []);

    const getActiveChip = useCallback(() => {
        return chipsState.chips[chipsState.graphName];
    }, [chipsState]);

    const setActiveChip = useCallback((graphName: string) => {
        setChipsState((prevState) => ({
            ...prevState,
            graphName,
        }));
    }, []);

    const value = useMemo<ChipContextType>(
        () => ({
            chipState: chipsState,
            addChip,
            resetChips,
            setGraphName,
            getActiveChip,
            setActiveChip,
            getChipByGraphName,
        }),
        [chipsState, addChip, resetChips, setGraphName, getActiveChip, setActiveChip, getChipByGraphName],
    );

    return <ChipContext.Provider value={value}>{children}</ChipContext.Provider>;
};

export { ChipContext, ChipProvider };