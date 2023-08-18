import React from 'react';
import {Pipe, convertBytes, GenericNOCLink} from '../../data/DataStructures';
import ProgressBar from './ProgressBar';
import SelectablePipe from './SelectablePipe';
import {calculateLinkCongestionColor} from '../../utils/DrawingAPI';

type LinkComponentProps = {
    link: GenericNOCLink;
    index?: number;
    showEmpty?: boolean;
};

const LinkComponent: React.FC<LinkComponentProps> = ({link, showEmpty, index}) => {
    const color: string = calculateLinkCongestionColor(link.linkSaturation, 0);
    if (!showEmpty) {
        if (link.totalDataBytes === 0) {
            return null;
        }
    }

    return (
        <div key={link.id}>
            <h5 className={`link-title-details ${link.totalDataBytes === 0 ? 'inactive' : ''}`}>
                <span>
                    {link.id} - {index > -1 ? `${index} - ` : ''}
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
