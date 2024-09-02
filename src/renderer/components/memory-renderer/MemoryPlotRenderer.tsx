// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import { Config, Layout, PlotData } from 'plotly.js';
import { PlotConfiguration } from './PlotConfigurations';

export interface MemoryPlotRendererProps {
    chartData: Partial<PlotData>[];
    isZoomedIn: boolean;
    memorySize: number;
    title: string;
    plotZoomRangeStart?: number;
    plotZoomRangeEnd?: number;
    configuration: PlotConfiguration;
}

const MemoryPlotRenderer: React.FC<MemoryPlotRendererProps> = ({
    chartData,
    isZoomedIn,
    memorySize,
    title,
    plotZoomRangeStart,
    plotZoomRangeEnd,
    configuration,
}) => {
    const layout: Partial<Layout> = {
        height: configuration.height,
        xaxis: {
            autorange: false,
            title: configuration.title || '',
            range: [isZoomedIn ? plotZoomRangeStart : 0, isZoomedIn ? plotZoomRangeEnd : memorySize],
            showgrid: true,
            fixedrange: true,
            zeroline: false,
            tickformat: 'd',
            color: 'white',
            gridcolor: '#999',
        },
        yaxis: {
            range: [0, 1],
            fixedrange: true,
            showgrid: false,
            zeroline: false,
            showticklabels: false,
        },
        margin: configuration.margin,

        paper_bgcolor: 'transparent',
        plot_bgcolor: 'white',
        shapes: [
            {
                type: 'rect',
                xref: 'paper',
                yref: 'paper',
                x0: 0,
                y0: 0,
                x1: 1,
                y1: 1,
                line: {
                    color: 'black',
                    width: 0.5,
                },
            },
        ],
        showlegend: false,
        hovermode: 'closest',
    };

    const config: Partial<Config> = {
        displayModeBar: false,
        displaylogo: false,
        staticPlot: false,
    };

    const plotRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={plotRef}>
            <h3 className='plot-title'>{title}</h3>
            <Plot className='memory-plot' data={chartData} layout={layout} config={config} />
        </div>
    );
};

export default MemoryPlotRenderer;
