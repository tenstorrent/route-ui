import React from 'react';
import classNames from 'classnames';
import { Chunk } from '../../../data/MemoryChunk';
import { getBufferColor } from '../../../MemoryColorGenerator';
import { formatMemoryAddress, formatSize, formatToHex, numberFormatter } from '../../utils/numbers';

export const MemoryLegendElement: React.FC<{
    chunk: Chunk;
    memSize: number;
    selectedTensorAddress: number | null;
    shouldShowConsumedSize?: boolean;
}> = ({
    // no wrap eslint
    chunk,
    memSize,
    selectedTensorAddress,
    shouldShowConsumedSize = true,
}) => {
    return (
        <tr
            key={chunk.address}
            className={classNames({
                dimmed: selectedTensorAddress !== null && selectedTensorAddress !== chunk.address,
            })}
        >
            <td>
                <span
                    className='memory-color-block'
                    style={{
                        backgroundColor: getBufferColor(chunk.address),
                    }}
                />
            </td>
            <td>
                <code>
                    {formatMemoryAddress(chunk.address, memSize)}
                    {' / '}
                    {formatToHex(chunk.address)}
                </code>
            </td>
            {shouldShowConsumedSize && (
                <td>
                    <code>{formatSize(chunk.consumedSize)}</code>
                </td>
            )}
            <td>
                <code>{formatSize(chunk.size)}</code>
            </td>
            {shouldShowConsumedSize && (
                <td>
                    <code>{numberFormatter(chunk.percentConsumed, '%')}</code>
                </td>
            )}
        </tr>
    );
};
