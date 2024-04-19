// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import React, { ReactNode, createContext, useCallback, useMemo, useState } from 'react';
import GraphOnChip from './GraphOnChip';
import type { GraphRelationship } from './StateTypes';
import { GraphVertexType } from './GraphNames';
import { Operand } from './Graph';

interface OperandDescriptor {
    name: string;
    graphName: string;
    temporalEpoch: number;
    type: GraphVertexType;
    operand: Operand;
}

interface ApplicationModelState {
    operands: Map<string, OperandDescriptor>;
    visitedGraphs: string[];
    currentGraphIndex: number;
    graphOnChipList: {
        [graphName: string]: GraphOnChip;
    };
    graphs: Map<string, GraphRelationship>;
}

interface GraphOnChipContextType {
    loadGraphOnChips: (newChips: GraphOnChip[], graphs: GraphRelationship[]) => void;
    resetGraphOnChipState: () => void;
    getGraphRelationshipList: () => GraphRelationship[];
    getActiveGraphRelationship: () => GraphRelationship | undefined;
    getActiveGraphOnChip: () => GraphOnChip | undefined;
    getPreviousGraphList: () => string[];
    getNextGraphList: () => string[];
    setActiveGraph: (graphName: string) => void;
    selectPreviousGraph: () => void;
    selectNextGraph: () => void;
    getGraphOnChip: (graphName: string) => GraphOnChip | undefined;
    getActiveGraphName: () => string;
    graphOnChipList: Record<string, GraphOnChip>;
    getOperand: (edgeName: string) => OperandDescriptor | undefined;
}

const applicationModelState: ApplicationModelState = {
    operands: new Map<string, OperandDescriptor>(),
    visitedGraphs: [],
    currentGraphIndex: 0,
    graphOnChipList: {},
    graphs: new Map<string, GraphRelationship>(),
};

const GraphOnChipContext = createContext<GraphOnChipContextType>({
    loadGraphOnChips: () => {},
    resetGraphOnChipState: () => {},
    getGraphRelationshipList: () => [],
    getActiveGraphRelationship: () => undefined,
    getActiveGraphOnChip: () => undefined,
    getPreviousGraphList: () => [],
    getNextGraphList: () => [],
    setActiveGraph: () => {},
    selectPreviousGraph: () => {},
    selectNextGraph: () => {},
    getGraphOnChip: () => undefined,
    getActiveGraphName: () => '',
    graphOnChipList: {},
    getOperand: () => undefined,
});

const GraphOnChipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ApplicationModelState>(applicationModelState);

    const loadGraphOnChips = useCallback((newChips: GraphOnChip[], graphs: GraphRelationship[]) => {
        const operands: OperandDescriptor[] = newChips
            .map((graphOnChip, index) => {
                const { temporalEpoch } = graphs[index];
                return [
                    ...[...graphOnChip.operations]
                        .filter((operation) => !operation.isOffchip)
                        .map((operation) => ({
                            name: operation.name,
                            graphName: graphs[index].name,
                            temporalEpoch,
                            type: GraphVertexType.OPERATION,
                            operand: operation as Operand,
                        })),
                    ...[...graphOnChip.queues].map((queue) => ({
                        name: queue.name,
                        graphName: graphs[index].name,
                        temporalEpoch,
                        type: GraphVertexType.QUEUE,
                        operand: queue as Operand,
                    })),
                ];
            })
            .flat();
        setState({
            visitedGraphs: [],
            currentGraphIndex: 0,
            graphOnChipList: Object.fromEntries(newChips.map((chip, index) => [graphs[index].name, chip])),
            graphs: new Map(graphs.map((graph) => [graph.name, graph])),
            operands: new Map(operands.map((edge) => [edge.name, edge])),
        });
    }, []);

    const getGraphOnChip = useCallback(
        (graphName: string) => {
            return state.graphOnChipList[graphName];
        },
        [state.graphOnChipList],
    );

    const reset = useCallback(() => {
        setState({ ...applicationModelState, graphs: new Map() });
    }, []);

    const getGraphRelationshipList = useCallback(() => {
        return [...state.graphs.values()];
    }, [state]);

    const getActiveGraphRelationship = useCallback(() => {
        return state.graphs.get(state.visitedGraphs[state.currentGraphIndex] ?? '');
    }, [state]);

    const getActiveGraphOnChip = useCallback(() => {
        return state.graphOnChipList[state.visitedGraphs[state.currentGraphIndex] ?? ''];
    }, [state]);

    const getPreviousGraphList = useCallback(() => {
        return state.visitedGraphs.slice(0, Math.max(0, state.currentGraphIndex));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.visitedGraphs]);

    const getNextGraphList = useCallback(() => {
        return state.visitedGraphs.slice(Math.min(state.visitedGraphs.length, state.currentGraphIndex + 1));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.visitedGraphs]);

    const setActiveGraph = useCallback((graphName: string) => {
        setState((prevState) => {
            if (prevState.visitedGraphs[prevState.currentGraphIndex] === graphName) {
                return prevState;
            }

            const newGraphList = [
                ...prevState.visitedGraphs.slice(0, Math.max(0, prevState.currentGraphIndex + 1)),
                graphName,
            ];

            return {
                ...prevState,
                currentGraphIndex: newGraphList.length - 1,
                visitedGraphs: newGraphList,
            };
        });
    }, []);

    const selectPreviousGraph = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            currentGraphIndex: Math.max(0, prevState.currentGraphIndex - 1),
            visitedGraphs: [...prevState.visitedGraphs],
        }));
    }, []);

    const selectNextGraph = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            currentGraphIndex: Math.min(prevState.visitedGraphs.length - 1, prevState.currentGraphIndex + 1),
            visitedGraphs: [...prevState.visitedGraphs],
        }));
    }, []);

    const getActiveGraphName = useCallback(() => {
        return state.visitedGraphs[state.currentGraphIndex] ?? '';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.visitedGraphs]);

    const getOperand = useCallback(
        (edgeName: string) => {
            return state.operands.get(edgeName);
        },
        [state.operands],
    );

    const value = useMemo<GraphOnChipContextType>(
        () => ({
            loadGraphOnChips,
            getActiveGraphOnChip,
            getActiveGraphRelationship,
            getGraphRelationshipList,
            getGraphOnChip,
            getActiveGraphName,
            resetGraphOnChipState: reset,
            getPreviousGraphList,
            getNextGraphList,
            setActiveGraph,
            selectPreviousGraph,
            selectNextGraph,
            graphOnChipList: state.graphOnChipList,
            getOperand,
        }),
        [
            loadGraphOnChips,
            getActiveGraphOnChip,
            getActiveGraphRelationship,
            getGraphRelationshipList,
            getGraphOnChip,
            getActiveGraphName,
            reset,
            getPreviousGraphList,
            getNextGraphList,
            setActiveGraph,
            selectPreviousGraph,
            selectNextGraph,
            state.graphOnChipList,
            getOperand,
        ],
    );

    return <GraphOnChipContext.Provider value={value}>{children}</GraphOnChipContext.Provider>;
};

export { GraphOnChipContext, GraphOnChipProvider };
