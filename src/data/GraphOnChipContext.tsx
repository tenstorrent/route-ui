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

interface GraphOnChipAndRelationship {
    graph: GraphRelationship;
    graphOnChip: GraphOnChip;
}

interface ApplicationModelState {
    operands: Map<string, OperandDescriptor>;
    graphOnChipList: {
        [graphName: string]: GraphOnChip;
    };
    graphs: Map<string, GraphRelationship>;
    graphsByTemporalEpoch: Map<number, GraphOnChipAndRelationship[]>;
}

interface GraphOnChipContextType {
    loadGraphOnChips: (newChips: GraphOnChip[], graphs: GraphRelationship[]) => void;
    resetGraphOnChipState: () => void;
    getGraphRelationshipList: () => GraphRelationship[];
    getGraphRelationshipByGraphName: (graphName: string) => GraphRelationship | undefined;
    getGraphsListByTemporalEpoch: () => Map<number, GraphRelationship[]>;
    getGraphOnChip: (temporalEpoch: number, chipId: number) => GraphOnChip | undefined;
    getOperand: (edgeName: string) => OperandDescriptor | undefined;
    getGraphOnChipListForTemporalEpoch: (epoch: number, chipId?: number) => GraphOnChipAndRelationship[];
}

const applicationModelState: ApplicationModelState = {
    operands: new Map<string, OperandDescriptor>(),
    graphOnChipList: {},
    graphs: new Map<string, GraphRelationship>(),
    graphsByTemporalEpoch: new Map<number, GraphOnChipAndRelationship[]>(),
};

const GraphOnChipContext = createContext<GraphOnChipContextType>({
    loadGraphOnChips: () => {},
    resetGraphOnChipState: () => {},
    getGraphRelationshipList: () => [],
    getGraphRelationshipByGraphName: () => undefined,
    getGraphsListByTemporalEpoch: () => new Map(),
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

        const graphOnChipList = Object.fromEntries(newChips.map((chip, index) => [graphs[index].name, chip]));
        const graphRelationships = new Map(graphs.map((graph) => [graph.name, graph]));
        const graphsByTemporalEpoch = [...graphRelationships.entries()].reduce(
            (graphsByEpoch, [graphName, graphRelationship]) => {
                if (!graphsByEpoch.has(graphRelationship.temporalEpoch)) {
                    graphsByEpoch.set(graphRelationship.temporalEpoch, []);
                }

                graphsByEpoch.set(graphRelationship.temporalEpoch, [
                    ...graphsByEpoch.get(graphRelationship.temporalEpoch)!,
                    {
                        graph: graphRelationship,
                        graphOnChip: graphOnChipList[graphName],
                    },
                ]);

                return graphsByEpoch;
            },
            new Map<number, GraphOnChipAndRelationship[]>(),
        );

        setState({
            graphOnChipList,
            graphs: graphRelationships,
            operands: new Map(operands.map((edge) => [edge.name, edge])),
            graphsByTemporalEpoch,
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
        setState({
            ...applicationModelState,
            graphs: new Map(),
            graphsByTemporalEpoch: new Map(),
            operands: new Map(),
        });
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

    const getGraphOnChipListForTemporalEpoch = useCallback(
        (epoch: number, chipId?: number) => {
            let graphArray = [...(state.graphsByTemporalEpoch.get(epoch) ?? [])];

            if (chipId !== undefined) {
                if (state.graphsByTemporalEpoch.get(epoch)?.[chipId]) {
                    graphArray = [state.graphsByTemporalEpoch.get(epoch)![chipId]];
                } else {
                    graphArray = [];
                }
            }

            return graphArray;
        },
        [state.graphsByTemporalEpoch],
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
