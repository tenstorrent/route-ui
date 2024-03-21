import { Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { FC, useContext, useMemo, type PropsWithChildren } from 'react';
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
    const producers = useMemo(
        () => [
            ...new Set(
                (graphOnChip?.pipes.get(pipeId)?.producerCores ?? []).map(
                    (core) => graphOnChip?.getNode(core)?.operation?.name,
                ),
            ),
        ],
        [graphOnChip, pipeId],
    );
    const consumers = useMemo(
        () => [
            ...new Set(
                (graphOnChip?.pipes.get(pipeId)?.consumerCores ?? []).map(
                    (core) => graphOnChip?.getNode(core)?.operation?.name,
                ),
            ),
        ],
        [graphOnChip, pipeId],
    );

    return (
        <div
            className='pipe-info-dialog'
            onMouseEnter={() => {
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
                disabled={hide || (!producers.length && !consumers.length)}
                usePortal
                content={
                    <>
                        {producers.length > 0 && (
                            <div className='producer-consumer'>
                                <h3>Producer:</h3>
                                <h2>{producers}</h2>
                            </div>
                        )}
                        {consumers.length > 0 && (
                            <div className='producer-consumer'>
                                <h3>Consumer:</h3>
                                <h2>{consumers}</h2>
                            </div>
                        )}
                    </>
                }
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
