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

interface DetailedViewCoreRendererProps {
    node: ComputeNode;
    temporalEpoch: number;
}

const DetailedViewCoreRenderer: React.FC<DetailedViewCoreRendererProps> = ({ node, temporalEpoch }) => {
    /**
     * Binary buffers: These are buffers statically allocated in L1, containing NCRISC binaries,
     * Overlay Binaries, and Trisc Binaries. Every worker core should all have these buffers
     * (though the sizes of these buffers may differ across cores).
     * Since these buffers are statically allocated, they have a static reserved size that may be larger
     * than the actual consumed size. For example I could allocate 4096 bytes (reserved size) for trisc0 binaries,
     * but the actual trisc0 binary may only be 1024 bytes large (consumed size).
     * We also show the address that this buffer is allocated at.
     *
     *
     * Data buffers: These are dynamically allocated, and therefore differ between worker cores.
     * These buffers serve different purposes. For example relay buffers hold temporary data to be forwarded to other cores,
     * packer stream buffers hold data packed to L1 from the packer kernel.
     * For these buffers it's assumed that the consumed size equals the reserved size.
     * We also show the address that this buffer is allocated at.
     */

    const MINIMAL_MEMORY_RANGE_OFFSET = 0.998;
    const [zoomedInView, setZoomedInView] = useState(false);

    // TODO: we need to find a creative way to render CONSUMED size vs SIZE - this might become interesting metrics to show
    // TODO: maybe a toggle to flip between the two with a ghosting allocated size overlay

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
                {/* TODO: render operation name here */}
                {/* TODO: render operation type here, that might come from core-attributes */}
                {/* potentially add op type to operation model (it exists in other sources) */}

                <Switch
                    label={zoomedInView ? 'Full buffer reports' : 'Zoom buffer reports'}
                    checked={zoomedInView}
                    onChange={() => setZoomedInView(!zoomedInView)}
                />
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
                                <th>Address (Decimal)</th>
                                <th>Addres (Hex)</th>
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
                                <th>Address (Decimal)</th>
                                <th>Addres (Hex)</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                    {/* we want to add consumed vs allocated here below */}
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
                {/* above zoom range is hardcoded temporarily */}
            </div>
            {/* TODO: we may want to do buffers legend below each chart */}
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
