// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Icon, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { FC, type PropsWithChildren, useContext } from 'react';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';

import './PipeInfoDialog.scss';
import type { LocationState } from '../../data/StateTypes';
import AsyncComponent from './AsyncRenderer';

export interface PipeInfoDialogProps {
    pipeId: string;
    hide?: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
}

/**
 * PipeInfoDialog
 * @description This wrapper component is used to display information about a Pipe Segment when the user hovers over it
 */
const PipeInfoDialog: FC<PropsWithChildren<PipeInfoDialogProps>> = ({ children, pipeId, hide, onEnter, onLeave }) => {
    const location: Location<LocationState> = useLocation();
    const { epoch, chipId } = location.state;
    const graphOnChipList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch, chipId);

    return (
        <div
            className='pipe-info-dialog'
            onMouseEnter={() => {
                requestAnimationFrame(() => onEnter?.());
            }}
            onFocus={() => {
                requestAnimationFrame(() => onEnter?.());
            }}
            onMouseOut={() => {
                requestAnimationFrame(() => onLeave?.());
            }}
            onBlur={() => {
                requestAnimationFrame(() => onLeave?.());
            }}
        >
            <Tooltip2
                disabled={hide}
                usePortal
                content={
                    <AsyncComponent
                        // eslint-disable-next-line @typescript-eslint/require-await
                        renderer={async () => {
                            const producers = [
                                ...new Set(
                                    graphOnChipList
                                        .flatMap(({ graphOnChip }) =>
                                            graphOnChip.pipes
                                                .get(pipeId)
                                                ?.producerCores?.map(
                                                    (core) => graphOnChip.getNode(core)?.operation?.name,
                                                ),
                                        )
                                        .filter((opName) => opName),
                                ),
                            ];
                            const consumers = [
                                ...new Set(
                                    graphOnChipList
                                        .flatMap(({ graphOnChip }) =>
                                            graphOnChip.pipes
                                                .get(pipeId)
                                                ?.consumerCores?.map(
                                                    (core) => graphOnChip.getNode(core)?.operation?.name,
                                                ),
                                        )
                                        .filter((opName) => opName),
                                ),
                            ];

                            return (
                                <div className='producer-consumer-tooltip'>
                                    <h3>
                                        <Icon icon={IconNames.EXPORT} className='producer-icon' />
                                        Producer{producers.length > 1 ? 's' : ''}:
                                    </h3>
                                    {producers.length > 0 ? (
                                        <ul>
                                            {producers.map((producer) => (
                                                <li key={producer}>{producer}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <ul>
                                            <li>&mdash;</li>
                                        </ul>
                                    )}
                                    <h3>
                                        <Icon icon={IconNames.IMPORT} className='consumer-icon' />
                                        Consumer{consumers.length > 1 ? 's' : ''}:
                                    </h3>
                                    {consumers.length > 0 ? (
                                        <ul>
                                            {consumers.map((consumer) => (
                                                <li key={consumer}>{consumer}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <ul>
                                            <li>&mdash;</li>
                                        </ul>
                                    )}
                                </div>
                            );
                        }}
                        loadingContent='Loading Producers/Consumers...'
                    />
                }
                position={Position.BOTTOM_RIGHT}
                hoverOpenDelay={100}
            >
                <div className='pipe-info-dialog-wrapper'>{children}</div>
            </Tooltip2>
        </div>
    );
};

PipeInfoDialog.defaultProps = {
    hide: false,
    onEnter: undefined,
    onLeave: undefined,
};

export default PipeInfoDialog;
