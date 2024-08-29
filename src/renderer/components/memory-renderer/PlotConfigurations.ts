import { PlotData } from 'plotly.js';
import { Chunk } from '../../../data/MemoryChunk';
import { getBufferColor } from '../../../MemoryColorGenerator';
import { formatSize, formatToHex } from '../../utils/numbers';

export const L1RenderConfiguration: PlotConfiguration = {
    height: 110,
    margin: {
        l: 5,
        r: 5,
        b: 40,
        t: 25,
    },
    title: 'L1 Address Space',
};

export interface PlotConfiguration {
    height: number;
    margin: {
        l: number;
        r: number;
        b: number;
        t: number;
    };
    title?: string;
}

export const getChartData = (memory: Chunk[], includeUsage = false, showUsage = false): Partial<PlotData>[] => {
    const allocated: Partial<PlotData>[] = memory.map((chunk) => {
        const { address, size, consumedSize } = chunk;
        const color = getBufferColor(address);
        const sizeLabel = includeUsage
            ? `<span>Size:</span> ${formatSize(consumedSize)} / ${formatSize(size)} (${((consumedSize / size) * 100).toFixed(2)}%)`
            : `<span>Size:</span> ${formatSize(size)}`;
        return {
            x: [address + size / 2],
            y: [1],
            type: 'bar',
            width: [size],
            marker: {
                color,
                line: {
                    width: 0,
                    opacity: 0,
                    simplify: false,
                },
            },

            hoverinfo: 'none',
            hovertemplate: `
<span style="color:${color};font-size:20px;">&#9632;</span>
${address} (${formatToHex(address)}) <br>
${sizeLabel}
<extra></extra>`,

            hoverlabel: {
                align: 'left',
                bgcolor: 'white',
                padding: {
                    t: 10,
                    b: 10,
                    l: 10,
                    r: 10,
                },

                font: {
                    color: 'black',
                    weight: 'bold',
                    size: 14,
                },
            },
        };
    });

    const consumed: Partial<PlotData>[] = [];
    if (includeUsage && showUsage) {
        memory.forEach((chunk) => {
            const { address, size, consumedSize } = chunk;
            const barsize = consumedSize;
            const color = getBufferColor(address);
            const overlayColor = 'rgba(0, 0, 0, 0.3)';

            consumed.push({
                x: [address + barsize / 2],
                y: [1],
                type: 'bar',
                width: [barsize],
                marker: {
                    color: overlayColor,
                    line: {
                        width: 0,
                        // @ts-expect-error
                        opacity: 0,
                        simplify: false,
                    },
                },

                hoverinfo: 'none',
                hovertemplate: `
<span style="color:${color};font-size:20px;">&#9632;</span>
${address} (${formatToHex(address)}) <br>
<span>Size:</span> ${formatSize(consumedSize)} / ${formatSize(size)} (${((consumedSize / size) * 100).toFixed(2)}%)
<extra></extra>`,

                hoverlabel: {
                    align: 'left',
                    bgcolor: 'white',
                    padding: {
                        t: 10,
                        b: 10,
                        l: 10,
                        r: 10,
                    },

                    font: {
                        color: 'black',
                        // @ts-expect-error
                        weight: 'bold',
                        size: 14,
                    },
                },
            });
        });
    }
    return [...allocated, ...consumed];
};
