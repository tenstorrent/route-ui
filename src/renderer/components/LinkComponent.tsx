import React from 'react';
import {useSelector} from 'react-redux';
import {Pipe, convertBytes, GenericNOCLink} from '../../data/DataStructures';
import ProgressBar from './ProgressBar';
import SelectablePipe from './SelectablePipe';
import {calculateLinkCongestionColor} from '../../utils/DrawingAPI';
import {RootState} from '../../data/store';

type LinkComponentProps = {
    link: GenericNOCLink;
    index?: number;
    showEmpty?: boolean;
};

const LinkComponent: React.FC<LinkComponentProps> = ({link, showEmpty, index}) => {
    const isHighContrast = useSelector((state: RootState) => state.highContrast.enabled);
    const color: string = calculateLinkCongestionColor(link.linkSaturation, 0, isHighContrast);
    if (!showEmpty) {
        if (link.totalDataBytes === 0) {
            return null;
        }
    }

    return (
        <div key={link.id}>
            <h5 className={`link-title-details ${link.totalDataBytes === 0 ? 'inactive' : ''}`}>
                <span>
                    {link.id} - {index && index > -1 ? `${index} - ` : ''}
                    {convertBytes(link.totalDataBytes)} <br /> {convertBytes(link.bpc, 2)} of {convertBytes(link.maxBandwidth)}
                    <span style={{color}}> {link.linkSaturation.toFixed(2)}%</span>
                </span>
                {link.totalDataBytes > 0 && <ProgressBar percent={link.linkSaturation} color={color} />}
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
LinkComponent.defaultProps = {
    showEmpty: true,
    index: -1,
};
export default LinkComponent;
