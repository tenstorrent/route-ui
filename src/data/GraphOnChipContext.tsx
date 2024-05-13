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
    chipId: number;
}

interface ApplicationModelState {
    operands: Map<string, OperandDescriptor>;
    visitedGraphsHistory: string[];
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
    getGraphRelationshipByGraphName: (graphName: string) => GraphRelationship | undefined;
    getGraphsListByTemporalEpoch: () => Map<number, GraphRelationship[]>;
    /** @deprecated Function will be removed soon, use `getGraphOnchip` instead. */
    getActiveGraphOnChip: () => GraphOnChip | undefined;
    getPreviousGraphName: () => string | undefined;
    getNextGraphName: () => string | undefined;
    selectPreviousGraph: () => void;
    selectNextGraph: () => void;
    getGraphOnChip: (temporalEpoch: number, chipId: number) => GraphOnChip | undefined;
    getOperand: (edgeName: string) => OperandDescriptor | undefined;
    getGraphOnChipListForTemporalEpoch: (epoch: number) => { graph: GraphRelationship; graphOnChip: GraphOnChip }[];
}

const applicationModelState: ApplicationModelState = {
    operands: new Map<string, OperandDescriptor>(),
    visitedGraphsHistory: [],
    currentGraphIndex: 0,
    graphOnChipList: {},
    graphs: new Map<string, GraphRelationship>(),
};

const GraphOnChipContext = createContext<GraphOnChipContextType>({
    loadGraphOnChips: () => {},
    resetGraphOnChipState: () => {},
    getGraphRelationshipList: () => [],
    getGraphRelationshipByGraphName: () => undefined,
    getGraphsListByTemporalEpoch: () => new Map(),
    getActiveGraphOnChip: () => undefined,
    getPreviousGraphName: () => undefined,
    getNextGraphName: () => undefined,
    selectPreviousGraph: () => {},
    selectNextGraph: () => {},
    getGraphOnChip: () => undefined,
    getOperand: () => undefined,
    getGraphOnChipListForTemporalEpoch: () => [],
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
                            chipId: graphOnChip.chipId,
                        })),
                    ...[...graphOnChip.queues].map((queue) => ({
                        name: queue.name,
                        graphName: graphs[index].name,
                        temporalEpoch,
                        type: GraphVertexType.QUEUE,
                        operand: queue as Operand,
                        chipId: graphOnChip.chipId,
                    })),
                ];
            })
            .flat();
        setState({
            visitedGraphsHistory: [],
            currentGraphIndex: 0,
            graphOnChipList: Object.fromEntries(newChips.map((chip, index) => [graphs[index].name, chip])),
            graphs: new Map(graphs.map((graph) => [graph.name, graph])),
            operands: new Map(operands.map((edge) => [edge.name, edge])),
        });
    }, []);

    const getGraphOnChip = useCallback(
        (temporalEpoch: number, chipId: number) => {
            const graphRelationship = [...state.graphs.values()].find(
                (graph) => graph.temporalEpoch === temporalEpoch && graph.chipId === chipId,
            );

            return state.graphOnChipList[graphRelationship?.name ?? ''];
        },
        [state.graphs, state.graphOnChipList],
    );

    const reset = useCallback(() => {
        setState({ ...applicationModelState, graphs: new Map() });
    }, []);

    const getGraphRelationshipList = useCallback(() => {
        return [...state.graphs.values()];
    }, [state]);

    const getGraphRelationshipByGraphName = useCallback(
        (graphName: string) => state.graphs.get(graphName),
        [state.graphs],
    );

    const getGraphsListByTemporalEpoch = useCallback(() => {
        return [...state.graphs.values()].reduce<Map<number, GraphRelationship[]>>(
            (temporalEpochList, graphRelationship) => {
                if (!temporalEpochList.has(graphRelationship.temporalEpoch)) {
                    temporalEpochList.set(graphRelationship.temporalEpoch, []);
                }

                temporalEpochList.get(graphRelationship.temporalEpoch)!.push(graphRelationship);

                return temporalEpochList;
            },
            new Map(),
        );
    }, [state.graphs]);

    const getActiveGraphOnChip = useCallback(() => undefined, []);

    const getGraphOnChipListForTemporalEpoch = useCallback(
        (epoch: number) => {
            const graphArray: { graph: GraphRelationship; graphOnChip: GraphOnChip }[] = [];

            state.graphs.forEach((graph) => {
                if (graph.temporalEpoch === epoch) {
                    const { chipId } = state.graphOnChipList[graph.name];
                    graphArray[chipId] = { graph, graphOnChip: state.graphOnChipList[graph.name] };
                }
            });

            return graphArray;
        },
        [state.graphOnChipList, state.graphs],
    );

    const getPreviousGraphName = useCallback(() => {
        return state.visitedGraphsHistory[state.currentGraphIndex - 1];
    }, [state.currentGraphIndex, state.visitedGraphsHistory]);

    const getNextGraphName = useCallback(() => {
        return state.visitedGraphsHistory[state.currentGraphIndex + 1];
    }, [state.currentGraphIndex, state.visitedGraphsHistory]);

    const selectPreviousGraph = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            currentGraphIndex: Math.max(0, prevState.currentGraphIndex - 1),
            visitedGraphsHistory: [...prevState.visitedGraphsHistory],
        }));
    }, []);

    const selectNextGraph = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            currentGraphIndex: Math.min(prevState.visitedGraphsHistory.length - 1, prevState.currentGraphIndex + 1),
            visitedGraphsHistory: [...prevState.visitedGraphsHistory],
        }));
    }, []);

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
            getGraphRelationshipList,
            getGraphRelationshipByGraphName,
            getGraphsListByTemporalEpoch,
            getGraphOnChip,
            resetGraphOnChipState: reset,
            getPreviousGraphName,
            getNextGraphName,
            selectPreviousGraph,
            selectNextGraph,
            getOperand,
            getGraphOnChipListForTemporalEpoch,
        }),
        [
            loadGraphOnChips,
            getActiveGraphOnChip,
            getGraphRelationshipList,
            getGraphRelationshipByGraphName,
            getGraphsListByTemporalEpoch,
            getGraphOnChip,
            reset,
            getPreviousGraphName,
            getNextGraphName,
            selectPreviousGraph,
            selectNextGraph,
            getOperand,
            getGraphOnChipListForTemporalEpoch,
        ],
    );

    return <GraphOnChipContext.Provider value={value}>{children}</GraphOnChipContext.Provider>;
};

export { GraphOnChipContext, GraphOnChipProvider };
