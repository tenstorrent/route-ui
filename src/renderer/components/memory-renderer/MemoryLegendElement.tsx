import React from 'react';
import classNames from 'classnames';
import { Chunk } from '../../../data/MemoryChunk';
import { getBufferColor } from '../../../MemoryColorGenerator';
import { formatSize, prettyPrintAddress, toHex } from '../../utils/numbers';

// eslint-disable-next-line import/prefer-default-export
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
        <tr
            key={chunk.address}
            className={classNames({
                dimmed: selectedTensorAddress !== null && selectedTensorAddress !== chunk.address,
            })}
        >
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <td>
                <span
                    className='memory-color-block'
                    style={{
                        backgroundColor: getBufferColor(chunk.address),
                    }}
                />
            </td>
            <td className='format-numbers monospace'>{prettyPrintAddress(chunk.address, memSize)}</td>
            <td className='format-numbers monospace keep-left'>({toHex(chunk.address)})</td>
            {/* TODO: something like this but prettier and with % */}
            {/* <td className='format-numbers monospace'>{formatSize(chunk.consumedSize)} </td> */}
            <td className='format-numbers monospace'>{formatSize(chunk.size)} </td>
        </tr>
    );
};
