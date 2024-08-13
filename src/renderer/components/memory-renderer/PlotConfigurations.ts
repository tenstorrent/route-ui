import { PlotData } from 'plotly.js';
import { Chunk } from '../../../data/MemoryChunk';
import { getBufferColor } from '../../../MemoryColorGenerator';
import { formatSize, toHex } from '../../utils/numbers';

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

export const CONDENSED_PLOT_CHUNK_COLOR = '#9c9e9f';

export const getChartData = (memory: Chunk[]): Partial<PlotData>[] => {
    return memory.map((chunk) => {
        const { address, size } = chunk;
        const color = getBufferColor(address);
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
${address} (${toHex(address)}) <br>Size: ${formatSize(size)}
<extra></extra>`,

            hoverlabel: {
                align: 'right',
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
};
