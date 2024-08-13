import { PlotData } from 'plotly.js';
import { Chunk } from '../../../data/MemoryChunk';
import { getBufferColor } from '../../../MemoryColorGenerator';
import { formatSize, toHex } from '../../utils/numbers';
import { toRGBA } from '../../../utils/DrawingAPI';

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

export const getChartData = (memory: Chunk[], includeUsage: boolean = false): Partial<PlotData>[] => {
    const allocated: Partial<PlotData>[] = memory.map((chunk) => {
        const { address, size } = chunk;
        const rgb = getBufferColor(address);
        const color = includeUsage ? toRGBA(rgb || 'rgb(255,255,255)', 0.3) : rgb;
        const label = includeUsage ? 'Allocated' : 'Size';
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
${address} (${toHex(address)}) <br>
<span>${label}:</span> ${formatSize(size)}
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

    let consumed: Partial<PlotData>[] = [];
    if (includeUsage) {
        consumed = memory.map((chunk) => {
            const { address, size, consumedSize } = chunk;
            const barsize = consumedSize;
            const color = getBufferColor(address);
            return {
                x: [address + barsize / 2],
                y: [1],
                type: 'bar',
                width: [barsize],
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
${address} (${toHex(address)}) <br>
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
                        weight: 'bold',
                        size: 14,
                    },
                },
            };
        });
    }
    return [...consumed, ...allocated];
};
