/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { Icon, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React, { FC, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';

import './PipeInfoDialog.scss';

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
    const graphOnChip = useContext(GraphOnChipContext).getActiveGraphOnChip();
    const [tooltipContent, setTooltipContent] = useState<React.JSX.Element | undefined>(undefined);

    const setupData = () => {
        const producers = [
            ...new Set(
                graphOnChip?.pipes
                    .get(pipeId)
                    ?.producerCores?.map((core) => graphOnChip?.getNode(core)?.operation?.name) ?? [],
            ),
        ];
        const consumers = [
            ...new Set(
                graphOnChip?.pipes
                    .get(pipeId)
                    ?.consumerCores?.map((core) => graphOnChip?.getNode(core)?.operation?.name) ?? [],
            ),
        ];

        if (producers.length === 0 && consumers.length === 0) {
            return undefined;
        }

        return (
            <div className='producer-consumer-tooltip'>
                {producers.length > 0 && (
                    <>
                        <h3>
                            <Icon icon={IconNames.EXPORT} className='producer-icon' />
                            Producer{producers.length > 1 ? 's' : ''}:
                        </h3>
                        <ul>
                            {producers.map((producer) => (
                                <li key={producer}>{producer}</li>
                            ))}
                        </ul>
                    </>
                )}
                {consumers.length > 0 && (
                    <>
                        <h3>
                            <Icon icon={IconNames.IMPORT} className='consumer-icon' />
                            Consumer{consumers.length > 1 ? 's' : ''}:
                        </h3>
                        <ul>
                            {consumers.map((consumer) => (
                                <li key={consumer}>{consumer}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        );
    };

    useEffect(() => {
        setTooltipContent(undefined);
    }, [graphOnChip]);

    return (
        <div
            className='pipe-info-dialog'
            onMouseEnter={() => {
                if (!tooltipContent) {
                    setTooltipContent(setupData());
                }

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
                disabled={hide || !tooltipContent}
                usePortal
                content={tooltipContent}
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
