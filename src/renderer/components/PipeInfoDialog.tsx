import { Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React, { FC, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';

import type { Pipe } from '../../data/GraphOnChip';
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
        const pipe: Pipe = graphOnChip?.pipes.get(pipeId) as Pipe;
        const output: React.JSX.Element[] = [];
        if (pipe) {
            if (pipe.producerCores.length > 0 || pipe.consumerCores.length > 0) {
                if (pipe.producerCores.length > 0) {
                    output.push(
                        <div className='producer-consumer'>
                            <h3>Producer:</h3>
                            <h2>
                                {[
                                    ...new Set(
                                        pipe.producerCores.map((core) => graphOnChip?.getNode(core)?.operation?.name),
                                    ),
                                ]}
                            </h2>
                        </div>,
                    );
                }
                if (pipe.consumerCores.length > 0) {
                    output.push(
                        <div className='producer-consumer'>
                            <h3>Consumer:</h3>
                            <h2>
                                {[
                                    ...new Set(
                                        pipe.consumerCores.map((core) => graphOnChip?.getNode(core)?.operation?.name),
                                    ),
                                ]}
                            </h2>
                        </div>,
                    );
                }
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{output}</>;
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

                onEnter?.();
            }}
            onFocus={() => {
                onEnter?.();
            }}
            onMouseOut={() => {
                onLeave?.();
            }}
            onBlur={() => {
                onLeave?.();
            }}
        >
            <Tooltip2
                disabled={hide || !tooltipContent}
                usePortal
                content={tooltipContent}
                position={Position.BOTTOM_RIGHT}
                hoverOpenDelay={130}
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
