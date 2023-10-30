import React, { FC, useContext, useEffect, useState } from 'react';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Position } from '@blueprintjs/core';
import { JSX } from 'react/jsx-runtime';
import DataSource from '../../data/DataSource';
import { Pipe } from '../../data/Chip';

export interface PipeInfoDialogProps {
    contents: React.ReactNode;
    pipeId: string;
    hide?: boolean;
}

/**
 * PipeInfoDialog
 * @description This wrapper component is used to display information about a Pipe Segment when the user hovers over it
 */
const PipeInfoDialog: FC<PipeInfoDialogProps> = ({ contents, pipeId, hide }) => {
    const [tooltipContent, setTooltipContent] = useState<JSX.Element | undefined>(undefined);
    const { chip } = useContext(DataSource);
    const setupData = () => {
        const pipe: Pipe = chip?.pipes.get(pipeId) as Pipe;
        const out: JSX.Element[] = [];
        if (pipe.producerCores.length > 0 || pipe.consumerCores.length > 0) {
            if (pipe.producerCores.length > 0) {
                out.push(
                    <div className="producer-consumer">
                        <h3>Producer:</h3>
                        <h2>{[...new Set(pipe.producerCores.map((core) => chip?.getNode(core)?.operation?.name))]}</h2>
                    </div>,
                );
            }
            if (pipe.consumerCores.length > 0) {
                out.push(
                    <div className="producer-consumer">
                        <h3>Consumer:</h3>
                        <h2>{[...new Set(pipe.consumerCores.map((core) => chip?.getNode(core)?.operation?.name))]}</h2>
                    </div>,
                );
            }
        } else {
            return undefined;
        }

        // becuase this is a useful fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return out;
    };

    useEffect(() => {
        setTooltipContent(undefined);
    }, [chip]);

    if (hide) {
        return contents as JSX.Element
    }

    return (
        <Tooltip2
            //
            usePortal={false}
            content={tooltipContent}
            position={Position.BOTTOM_RIGHT}
            hoverOpenDelay={150}
        >
            <div
                className='pipe-info-dialog'
                onMouseEnter={() => {
                    if (!tooltipContent) {
                        setTooltipContent(setupData());
                    }
                }}
            >
                {contents}
            </div>
        </Tooltip2>
    );
};

PipeInfoDialog.defaultProps = {
    hide: false,
};

export default PipeInfoDialog;
