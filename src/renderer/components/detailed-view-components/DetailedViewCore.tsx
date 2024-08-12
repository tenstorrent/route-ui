// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import React from 'react';
import { ComputeNode } from '../../../data/GraphOnChip';
import LinkDetails from '../LinkDetails';
import MemoryChunk from '../../../data/MemoryChunk';

interface DetailedViewCoreRendererProps {
    node: ComputeNode;
    temporalEpoch: number;
}

const DetailedViewCoreRenderer: React.FC<DetailedViewCoreRendererProps> = ({ node, temporalEpoch }) => {
    return (
        <>
            <div className='detailed-view-chip core'>
                <h4>data</h4>
                <div className='l1-memory'>
                    {node.coreL1Memory.dataBuffers.map((chunk: MemoryChunk) => (
                        <>
                            <span>
                                {chunk.address} / {chunk.size}
                            </span>
                            <br />
                        </>
                    ))}
                </div>
                <h4>binary</h4>
                <div className='l1-memory'>
                    {node.coreL1Memory.binaryBuffers.map((chunk: MemoryChunk) => (
                        <>
                            <span>
                                {chunk.address} / {chunk.size}
                            </span>
                            <br />
                        </>
                    ))}
                </div>
            </div>
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
