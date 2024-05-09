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
    getGraphsListByTemporalEpoch: () => Map<number, GraphRelationship[]>;
    getActiveGraphRelationship: () => GraphRelationship | undefined;
    getActiveGraphOnChip: () => GraphOnChip | undefined;
    getPreviousGraphName: () => string | undefined;
    getNextGraphName: () => string | undefined;
    setActiveGraph: (graphName: string) => void;
    selectPreviousGraph: () => void;
    selectNextGraph: () => void;
    getGraphOnChip: (graphName: string) => GraphOnChip | undefined;
    getActiveGraphName: () => string;
    graphOnChipList: Record<string, GraphOnChip>;
    getOperand: (edgeName: string) => OperandDescriptor | undefined;
    getActiveGraphOnChipListForTemporalEpoch: () => { graph: GraphRelationship; graphOnChip: GraphOnChip }[];
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
    getGraphsListByTemporalEpoch: () => new Map(),
    getActiveGraphRelationship: () => undefined,
    getActiveGraphOnChip: () => undefined,
    getPreviousGraphName: () => undefined,
    getNextGraphName: () => undefined,
    setActiveGraph: () => {},
    selectPreviousGraph: () => {},
    selectNextGraph: () => {},
    getGraphOnChip: () => undefined,
    getActiveGraphName: () => '',
    graphOnChipList: {},
    getOperand: () => undefined,
    getActiveGraphOnChipListForTemporalEpoch: () => [],
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

    const getActiveGraphRelationship = useCallback(() => {
        return state.graphs.get(state.visitedGraphsHistory[state.currentGraphIndex] ?? '');
    }, [state]);

    const getActiveGraphOnChip = useCallback(() => {
        return state.graphOnChipList[state.visitedGraphsHistory[state.currentGraphIndex] ?? ''];
    }, [state]);

    const getActiveGraphOnChipListForTemporalEpoch = useCallback(() => {
        const epoch = getActiveGraphRelationship()?.temporalEpoch;
        const listOfGraphRel: GraphRelationship[] = [...state.graphs.values()].filter((graph: GraphRelationship) => {
            return graph.temporalEpoch === epoch;
        });
        return listOfGraphRel.map((graph) => {
            return { graph, graphOnChip: state.graphOnChipList[graph.name] };
        });
    }, [getActiveGraphRelationship, state.graphOnChipList, state.graphs]);

    const getGraphOnChipListForTemporalEpoch = useCallback(
        (epoch: number) => {
            const listOfGraphRel: GraphRelationship[] = [...state.graphs.values()].filter(
                (graph: GraphRelationship) => {
                    return graph.temporalEpoch === epoch;
                },
            );
            return listOfGraphRel
                .map((graph) => {
                    return { graph, graphOnChip: state.graphOnChipList[graph.name] };
                })
                .sort((a, b) => a.graphOnChip.chipId - b.graphOnChip.chipId);
        },
        [state.graphOnChipList, state.graphs],
    );

    const getPreviousGraphName = useCallback(() => {
        return state.visitedGraphsHistory[state.currentGraphIndex - 1];
    }, [state.currentGraphIndex, state.visitedGraphsHistory]);

    const getNextGraphName = useCallback(() => {
        return state.visitedGraphsHistory[state.currentGraphIndex + 1];
    }, [state.currentGraphIndex, state.visitedGraphsHistory]);

    const setActiveGraph = useCallback((graphName: string) => {
        setState((prevState) => {
            if (prevState.visitedGraphsHistory[prevState.currentGraphIndex] === graphName) {
                return prevState;
            }

            const newGraphList = [
                ...prevState.visitedGraphsHistory.slice(0, Math.max(0, prevState.currentGraphIndex + 1)),
                graphName,
            ];

            return {
                ...prevState,
                currentGraphIndex: newGraphList.length - 1,
                visitedGraphsHistory: newGraphList,
            };
        });
    }, []);

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

    const getActiveGraphName = useCallback(() => {
        return state.visitedGraphsHistory[state.currentGraphIndex] ?? '';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.visitedGraphsHistory]);

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
            getGraphsListByTemporalEpoch,
            getGraphOnChip,
            getActiveGraphName,
            resetGraphOnChipState: reset,
            getPreviousGraphName,
            getNextGraphName,
            setActiveGraph,
            selectPreviousGraph,
            selectNextGraph,
            graphOnChipList: state.graphOnChipList,
            getOperand,
            getActiveGraphOnChipListForTemporalEpoch,
            getGraphOnChipListForTemporalEpoch,
        }),
        [
            loadGraphOnChips,
            getActiveGraphOnChip,
            getActiveGraphRelationship,
            getGraphRelationshipList,
            getGraphsListByTemporalEpoch,
            getGraphOnChip,
            getActiveGraphName,
            reset,
            getPreviousGraphName,
            getNextGraphName,
            setActiveGraph,
            selectPreviousGraph,
            selectNextGraph,
            state.graphOnChipList,
            getOperand,
            getActiveGraphOnChipListForTemporalEpoch,
            getGraphOnChipListForTemporalEpoch,
        ],
    );

    return <GraphOnChipContext.Provider value={value}>{children}</GraphOnChipContext.Provider>;
};

export { GraphOnChipContext, GraphOnChipProvider };
