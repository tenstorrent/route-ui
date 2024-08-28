// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import React, { useMemo, useState } from 'react';
import { HTMLTable, Switch } from '@blueprintjs/core';
import { ComputeNode } from '../../../data/GraphOnChip';
import LinkDetails from '../LinkDetails';
import MemoryPlotRenderer from '../memory-renderer/MemoryPlotRenderer';
import { L1RenderConfiguration, getChartData } from '../memory-renderer/PlotConfigurations';
import { MemoryLegendElement } from '../memory-renderer/MemoryLegendElement';
import { formatSize } from '../../utils/numbers';

interface DetailedViewCoreRendererProps {
    node: ComputeNode;
    temporalEpoch: number;
}

const DetailedViewCoreRenderer: React.FC<DetailedViewCoreRendererProps> = ({ node, temporalEpoch }) => {
    const MINIMAL_MEMORY_RANGE_OFFSET = 0.998;
    const [zoomedInView, setZoomedInView] = useState(false);

    // usage should always be false
    const dataBuffers = getChartData(node.coreL1Memory.dataBuffers, false);
    const dataBuffersConfig = { ...L1RenderConfiguration };
    dataBuffersConfig.title = 'Data Buffers';
    const dataBufferZoomRangeStart = useMemo(
        () => (node.coreL1Memory.dataBuffers[0]?.address ?? 0) * MINIMAL_MEMORY_RANGE_OFFSET,
        [node.coreL1Memory.dataBuffers],
    );

    const dataBufferZoomRangeEnd = useMemo(() => {
        const lastItem = node.coreL1Memory.dataBuffers.at(-1);
        const lastAddress = lastItem?.address ?? 0;
        const lastSize = lastItem?.size ?? 0;

        return (lastAddress + lastSize) * (1 / MINIMAL_MEMORY_RANGE_OFFSET) || node.coreL1Memory.l1Size;
    }, [node.coreL1Memory.dataBuffers, node.coreL1Memory.l1Size]);

    const binaryBuffers = getChartData(node.coreL1Memory.binaryBuffers, true);
    const binaryBuffersConfig = { ...L1RenderConfiguration };
    binaryBuffersConfig.title = 'Binary Buffers';
    const binaryBufferZoomRangeStart = useMemo(
        () => (node.coreL1Memory.binaryBuffers[0]?.address ?? 0) * MINIMAL_MEMORY_RANGE_OFFSET,
        [node.coreL1Memory.binaryBuffers],
    );

    const binaryBufferZoomRangeEnd = useMemo(() => {
        const lastItem = node.coreL1Memory.binaryBuffers.at(-1);
        const lastAddress = lastItem?.address ?? 0;
        const lastSize = lastItem?.size ?? 0;

        return (lastAddress + lastSize) * (1 / MINIMAL_MEMORY_RANGE_OFFSET) || node.coreL1Memory.l1Size;
    }, [node.coreL1Memory.binaryBuffers, node.coreL1Memory.l1Size]);

    return (
        <>
            <div className='detailed-view-chip core'>
                {node.operation && (
                    <div className='op-details'>
                        <p>
                            <strong>Operation name:</strong>
                            &nbsp;
                            <output>{node.operation.name}</output>
                        </p>
                        {node.operation.type && (
                            <p>
                                <strong>Operation type:</strong>
                                &nbsp;
                                <output>{node.operation.type}</output>
                            </p>
                        )}
                        <p>
                            <strong>Memory (Consumed / Reserved):</strong>
                            &nbsp;
                            <output>
                                {formatSize(node.coreL1Memory.totalConsumedSize)}
                                &nbsp; / &nbsp;
                                {formatSize(node.coreL1Memory.totalReservedSize)}
                            </output>
                        </p>
                    </div>
                )}

                <p>
                    <Switch
                        label={zoomedInView ? 'Full buffer reports' : 'Zoom buffer reports'}
                        checked={zoomedInView}
                        onChange={() => setZoomedInView(!zoomedInView)}
                    />
                </p>

                <MemoryPlotRenderer
                    chartData={dataBuffers}
                    isZoomedIn={zoomedInView}
                    memorySize={node.coreL1Memory.l1Size}
                    title=''
                    configuration={dataBuffersConfig}
                    plotZoomRangeStart={dataBufferZoomRangeStart}
                    plotZoomRangeEnd={dataBufferZoomRangeEnd}
                />

                <div className='bp4-dark l1-table-wrapper'>
                    <HTMLTable striped compact>
                        <thead>
                            <tr>
                                <th>Color</th>
                                <th>Address (Dec / Hex)</th>
                                {/* For data buffers it is assumed the allocated size and consumed size are equal */}
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {node.coreL1Memory.dataBuffers.map((buffer) => {
                                return (
                                    <MemoryLegendElement
                                        chunk={buffer}
                                        memSize={node.coreL1Memory.l1Size}
                                        selectedTensorAddress={null}
                                        shouldShowConsumedSize={false}
                                    />
                                );
                            })}
                        </tbody>
                    </HTMLTable>
                </div>

                <MemoryPlotRenderer
                    chartData={binaryBuffers}
                    isZoomedIn={zoomedInView}
                    memorySize={node.coreL1Memory.l1Size}
                    title=''
                    configuration={binaryBuffersConfig}
                    plotZoomRangeStart={binaryBufferZoomRangeStart}
                    plotZoomRangeEnd={binaryBufferZoomRangeEnd}
                />
                <div className='bp4-dark l1-table-wrapper'>
                    <HTMLTable striped compact>
                        <thead>
                            <tr>
                                <th>Color</th>
                                <th>Address (Dec / Hex)</th>
                                <th>Consumed Size</th>
                                <th>Total Size</th>
                                <th>Consumed Percent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {node.coreL1Memory.binaryBuffers.map((buffer) => {
                                return (
                                    <MemoryLegendElement
                                        chunk={buffer}
                                        memSize={node.coreL1Memory.l1Size}
                                        selectedTensorAddress={null}
                                    />
                                );
                            })}
                        </tbody>
                    </HTMLTable>
                </div>
            </div>
            {/* TODO: we may also want fragmentation report. ei: find empty memory in between buffers and report it */}
            <div className='detailed-view-link-info'>
                <div className='node-links-wrap'>
                    {node.getInternalLinksForNode().map((link, index) => {
                        return (
                            <LinkDetails
                                key={link.name}
                                link={link}
                                temporalEpoch={temporalEpoch}
                                chipId={node.chipId}
                                index={index}
                                showEmpty={false}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default DetailedViewCoreRenderer;
