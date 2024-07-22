// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { getHighContrastState } from 'data/store/selectors/uiState.selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import { NetworkLink, PipeSegment, convertBytes, formatToBytesPerCycle } from '../../data/GraphOnChip';
import { calculateLinkCongestionColor } from '../../utils/DrawingAPI';
import ProgressBar from './ProgressBar';
import SelectablePipe from './SelectablePipe';
import {
    getCLKMhz,
    getDRAMBandwidth,
    getPCIBandwidth,
    getTotalOps,
} from '../../data/store/selectors/linkSaturation.selectors';
import { recalculateLinkSaturationMetrics } from '../utils/linkSaturation';

type LinkDetailsProps = {
    temporalEpoch: number;
    chipId?: number;
    link: NetworkLink;
    index?: number;
    showEmpty?: boolean;
};

const LinkDetails: React.FC<LinkDetailsProps> = ({ link, temporalEpoch, chipId, showEmpty, index }) => {
    const isHighContrast = useSelector(getHighContrastState);
    const DRAMBandwidth = useSelector(getDRAMBandwidth);
    const PCIBandwidth = useSelector(getPCIBandwidth);
    const CLKMHz = useSelector(getCLKMhz);
    const totalOps = useSelector(getTotalOps(temporalEpoch, chipId));

    const { bpc, saturation, maxBandwidth } = recalculateLinkSaturationMetrics({
        DRAMBandwidth,
        PCIBandwidth,
        CLKMHz,
        totalOps,
        linkType: link.type,
        totalDataBytes: link.totalDataBytes,
        initialMaxBandwidth: link.maxBandwidth,
    });

    const color: string = calculateLinkCongestionColor(saturation || 0, 0, isHighContrast);

    if (!showEmpty) {
        if (link.totalDataBytes === 0) {
            return null;
        }
    }

    return (
        <div key={link.name}>
            <h5 className={`link-title-details ${link.totalDataBytes === 0 ? 'inactive' : ''}`}>
                <span>
                    <span>
                        {link.name} - {index && index > -1 ? `${index} - ` : ''}
                        {convertBytes(link.totalDataBytes)}
                    </span>
                    <br />
                    <span>
                        {formatToBytesPerCycle(bpc || 0, 2)}
                        &nbsp;of&nbsp;
                        {formatToBytesPerCycle(maxBandwidth)}
                        <span style={{ color }}> {saturation.toFixed(2)}%</span>
                    </span>
                </span>
                {link.totalDataBytes > 0 && <ProgressBar percent={saturation || 0} color={color} />}
            </h5>
            <ul className='node-pipelist'>
                {link.pipes.map((pipeSegment: PipeSegment) => (
                    <li key={pipeSegment.id}>
                        <SelectablePipe pipeSegment={pipeSegment} pipeFilter='' showBandwidthUse />
                    </li>
                ))}
            </ul>
        </div>
    );
};
LinkDetails.defaultProps = {
    chipId: undefined,
    showEmpty: true,
    index: -1,
};
export default LinkDetails;
