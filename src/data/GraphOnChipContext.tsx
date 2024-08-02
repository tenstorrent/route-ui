// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import React, { ReactNode, createContext, useCallback, useMemo, useState } from 'react';
import GraphOnChip from './GraphOnChip';
import type { GraphRelationship } from './StateTypes';
import { GraphVertexType } from './GraphNames';
import { Operand } from './Graph';

interface OperandDescriptor {
    name: string;
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
    graphsByTemporalEpoch: Map<number, GraphOnChipAndRelationship[]>;
}

interface GraphOnChipContextType {
    loadGraphOnChips: (newChips: GraphOnChip[], graphs: GraphRelationship[]) => void;
    resetGraphOnChipState: () => void;
    getGraphsByTemporalEpoch: () => Map<number, GraphOnChipAndRelationship[]>;
    getGraphOnChip: (temporalEpoch: number, chipId: number) => GraphOnChip | undefined;
    getOperand: (edgeName: string) => OperandDescriptor | undefined;
    getGraphOnChipListForTemporalEpoch: (epoch: number, chipId?: number) => GraphOnChipAndRelationship[];
}

const applicationModelState: ApplicationModelState = {
    operands: new Map<string, OperandDescriptor>(),
    graphsByTemporalEpoch: new Map<number, GraphOnChipAndRelationship[]>(),
};

const GraphOnChipContext = createContext<GraphOnChipContextType>({
    loadGraphOnChips: () => {},
    resetGraphOnChipState: () => {},
    getGraphsByTemporalEpoch: () => new Map(),
    getGraphOnChip: () => undefined,
    getOperand: () => undefined,
    getGraphOnChipListForTemporalEpoch: () => [],
});

const GraphOnChipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ApplicationModelState>(applicationModelState);

    const loadGraphOnChips = useCallback((newChips: GraphOnChip[], graphs: GraphRelationship[]) => {
        const operands: OperandDescriptor[] = newChips
            .map((graphOnChip, index) => {
                const { temporalEpoch, chipId } = graphs[index]!;

                return [
                    ...[...graphOnChip.operations]
                        .filter((op) => !op?.isOffchip(chipId) ?? true)
                        .map((operation) => ({
                            name: operation.name,
                            temporalEpoch,
                            type: GraphVertexType.OPERATION,
                            operand: operation as Operand,
                            chipId: graphOnChip.chipId,
                        })),
                    ...[...graphOnChip.queues].map((queue) => ({
                        name: queue.name,
                        temporalEpoch,
                        type: GraphVertexType.QUEUE,
                        operand: queue as Operand,
                        chipId: graphOnChip.chipId,
                    })),
                ];
            })
            .flat();

        const graphOnChipList = Object.fromEntries(newChips.map((chip, index) => [graphs[index]!.name, chip]));
        const graphsByTemporalEpoch = graphs.reduce((graphsByEpoch, graphRelationship) => {
            if (!graphsByEpoch.has(graphRelationship.temporalEpoch)) {
                graphsByEpoch.set(graphRelationship.temporalEpoch, []);
            }

            const normalizedGraphsList = graphsByEpoch.get(graphRelationship.temporalEpoch)!;

            normalizedGraphsList[graphRelationship.chipId] = {
                graph: graphRelationship,
                graphOnChip: graphOnChipList[graphRelationship.name]!,
            };

            graphsByEpoch.set(graphRelationship.temporalEpoch, normalizedGraphsList);

            return graphsByEpoch;
        }, new Map<number, GraphOnChipAndRelationship[]>());

        setState({
            operands: new Map(operands.map((edge) => [edge.name, edge])),
            graphsByTemporalEpoch,
        });
    }, []);

    const getGraphOnChip = useCallback(
        (temporalEpoch: number, chipId: number) => {
            return state.graphsByTemporalEpoch.get(temporalEpoch)?.[chipId]?.graphOnChip;
        },
        [state.graphsByTemporalEpoch],
    );

    const resetGraphOnChipState = useCallback(() => {
        setState({
            ...applicationModelState,
            graphsByTemporalEpoch: new Map(),
            operands: new Map(),
        });
    }, []);

    const getGraphsByTemporalEpoch = useCallback(() => state.graphsByTemporalEpoch, [state.graphsByTemporalEpoch]);

    const getGraphOnChipListForTemporalEpoch = useCallback(
        (epoch: number, chipId?: number) => {
            const graphArray = state.graphsByTemporalEpoch.get(epoch) ?? [];

            if (chipId !== undefined) {
                if (graphArray[chipId]) {
                    return [graphArray[chipId]!];
                }

                return [];
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
            getGraphsByTemporalEpoch,
            getGraphOnChip,
            resetGraphOnChipState,
            getOperand,
            getGraphOnChipListForTemporalEpoch,
        }),
        [
            loadGraphOnChips,
            getGraphsByTemporalEpoch,
            getGraphOnChip,
            resetGraphOnChipState,
            getOperand,
            getGraphOnChipListForTemporalEpoch,
        ],
    );

    return <GraphOnChipContext.Provider value={value}>{children}</GraphOnChipContext.Provider>;
};

export { GraphOnChipContext, GraphOnChipProvider };
