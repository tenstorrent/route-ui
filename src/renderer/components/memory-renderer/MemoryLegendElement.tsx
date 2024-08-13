import React from 'react';
import classNames from 'classnames';
import { Chunk } from '../../../data/MemoryChunk';
import { getBufferColor } from '../../../MemoryColorGenerator';
import { formatSize, prettyPrintAddress, toHex } from '../../utils/numbers';

export const MemoryLegendElement: React.FC<{
    chunk: Chunk;
    memSize: number;
    selectedTensorAddress: number | null;
}> = ({
    // no wrap eslint
    chunk,
    memSize,
    selectedTensorAddress,
}) => {
    return (
        <div
            key={chunk.address}
            className={classNames('legend-item', {
                dimmed: selectedTensorAddress !== null && selectedTensorAddress !== chunk.address,
            })}
        >
            <div
                className='memory-color-block'
                style={{
                    backgroundColor: getBufferColor(chunk.address),
                }}
            />
            <div className='legend-details'>
                <div className='format-numbers monospace'>{prettyPrintAddress(chunk.address, memSize)}</div>
                <div className='format-numbers monospace keep-left'>({toHex(chunk.address)})</div>
                {/* TODO: something like this but prettier and with % */}
                {/* <div className='format-numbers monospace'>{formatSize(chunk.consumedSize)} </div> */}
                <div className='format-numbers monospace'>{formatSize(chunk.size)} </div>
            </div>
        </div>
    );
};
