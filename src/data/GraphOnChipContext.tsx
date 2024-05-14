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
    getGraphOnChip: (
        temporalEpoch: number,
        chipId?: number,
    ) => { graph: GraphOnChip; relationship: GraphRelationship }[];
    getOperand: (edgeName: string) => OperandDescriptor | undefined;
    getGraphOnChipListForTemporalEpoch: (epoch: number) => { graph: GraphRelationship; graphOnChip: GraphOnChip }[];
}

const applicationModelState: ApplicationModelState = {
    operands: new Map<string, OperandDescriptor>(),
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
    getGraphOnChip: () => [],
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
            graphOnChipList: Object.fromEntries(newChips.map((chip, index) => [graphs[index].name, chip])),
            graphs: new Map(graphs.map((graph) => [graph.name, graph])),
            operands: new Map(operands.map((edge) => [edge.name, edge])),
        });
    }, []);

    const getGraphOnChip = useCallback(
        (temporalEpoch: number, chipId?: number) => {
            const graphs: { graph: GraphOnChip; relationship: GraphRelationship }[] = [];

            [...state.graphs.values()].forEach((graphRelationship) => {
                const isSameTemporalEpoch = graphRelationship.temporalEpoch === temporalEpoch;
                const hasChipId = chipId !== null && chipId !== undefined;
                const isSameChipId = graphRelationship.chipId === chipId;

                if (isSameTemporalEpoch) {
                    if (!hasChipId) {
                        graphs.push({
                            graph: state.graphOnChipList[graphRelationship.name],
                            relationship: graphRelationship,
                        });
                    }

                    if (hasChipId && isSameChipId) {
                        graphs.push({
                            graph: state.graphOnChipList[graphRelationship.name],
                            relationship: graphRelationship,
                        });
                    }
                }
            });

            return graphs;
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
            getOperand,
            getGraphOnChipListForTemporalEpoch,
        ],
    );

    return <GraphOnChipContext.Provider value={value}>{children}</GraphOnChipContext.Provider>;
};

export { GraphOnChipContext, GraphOnChipProvider };
