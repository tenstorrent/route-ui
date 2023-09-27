import React from 'react';
import {useSelector} from 'react-redux';
import {Pipe, convertBytes, GenericNOCLink} from '../../data/Chip';
import ProgressBar from './ProgressBar';
import SelectablePipe from './SelectablePipe';
import {calculateLinkCongestionColor} from '../../utils/DrawingAPI';
import {getLinkData, RootState, selectNodeSelectionById} from '../../data/store';

type LinkDetailsProps = {
    link: GenericNOCLink;
    index?: number;
    showEmpty?: boolean;
};

const LinkDetails: React.FC<LinkDetailsProps> = ({link, showEmpty, index}) => {
    const isHighContrast = useSelector((state: RootState) => state.highContrast.enabled);
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
                    {link.name} - {index && index > -1 ? `${index} - ` : ''}
                    {convertBytes(link.totalDataBytes)} <br /> {convertBytes(linkState?.bpc || 0, 2)} of {convertBytes(link.maxBandwidth)}
                    <span style={{color}}> {linkState?.saturation.toFixed(2)}%</span>
                </span>
                {link.totalDataBytes > 0 && <ProgressBar percent={linkState?.saturation || 0} color={color} />}
            </h5>
            <ul className="node-pipelist">
                {link.pipes.map((pipe: Pipe) => (
                    <li key={pipe.id}>
                        <SelectablePipe pipe={pipe} pipeFilter="" showBandwidthUse />
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
