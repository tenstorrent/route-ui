import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'data/store/createStore';
import { getLinkData } from 'data/store/selectors/linkSaturation.selectors';
import { getHighContrastState } from 'data/store/selectors/uiState.selectors';
import { PipeSegment, NetworkLink, formatToBytesPerCycle, convertBytes } from '../../data/Chip';
import ProgressBar from './ProgressBar';
import SelectablePipe from './SelectablePipe';
import { calculateLinkCongestionColor } from '../../utils/DrawingAPI';

type LinkDetailsProps = {
    link: NetworkLink;
    index?: number;
    showEmpty?: boolean;
};

const LinkDetails: React.FC<LinkDetailsProps> = ({ link, showEmpty, index }) => {
    const isHighContrast = useSelector(getHighContrastState);
    const linkState = useSelector((state: RootState) => getLinkData(state, link.uid));
    const color: string = calculateLinkCongestionColor(linkState?.saturation || 0, 0, isHighContrast);

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
                        {formatToBytesPerCycle(linkState?.bpc || 0, 2)}
                        &nbsp;of&nbsp;
                        {formatToBytesPerCycle(linkState?.maxBandwidth)}
                        <span style={{ color }}> {linkState?.saturation.toFixed(2)}%</span>
                    </span>
                </span>
                {link.totalDataBytes > 0 && <ProgressBar percent={linkState?.saturation || 0} color={color} />}
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
    showEmpty: true,
    index: -1,
};
export default LinkDetails;
