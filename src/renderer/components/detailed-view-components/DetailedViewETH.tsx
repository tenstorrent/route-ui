// new component DetailedViewDRAM

import React, { useContext, useMemo } from 'react';
import { ComputeNode, NetworkLink, NOCLink } from '../../../data/Chip';
import { NOCLinkName } from '../../../data/Types';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';
import LinkDetails from '../LinkDetails';
import { filterIterable } from '../../../utils/IterableHelpers';
import DataSource, { GridContext } from '../../../data/DataSource';
import DetailedViewPipeControls from './DetailedViewPipeControls';
import DetailedViewNOCRouterRenderer from './DetailedViewNOCRouterRenderer';

interface DetailedViewETHRendererProps {
    node: ComputeNode;
}

const DetailedViewETHRenderer: React.FC<DetailedViewETHRendererProps> = ({ node }) => {
    const noc0links: NOCLink[] = [];
    const noc1links: NOCLink[] = [];
    let internalLinks: NetworkLink[] = [];
    if (node) {
        noc0links.push(node.links.get(NOCLinkName.NOC0_IN) as NOCLink);
        noc0links.push(node.links.get(NOCLinkName.NOC0_OUT) as NOCLink);
        noc1links.push(node.links.get(NOCLinkName.NOC1_IN) as NOCLink);
        noc1links.push(node.links.get(NOCLinkName.NOC1_OUT) as NOCLink);

        internalLinks = [...node.internalLinks.values()];
    }
    const numPipes = [...node.links.values()].map((link) => link.pipes).flat().length;

    return (
        <>
            <div className='detailed-view-chip eth'>
                <div>
                    <DetailedViewPipeControls node={node} numPipes={numPipes} />
                    <div className='chip-container'>
                        <div className='wrapper'>
                            <div className='node-container'>
                                <div className='node'>
                                    <div className='col noc0'>
                                        <DetailedViewNOCRouterRenderer links={noc0links} label="NOC0" />
                                    </div>
                                    <div className='col noc1'>
                                        <DetailedViewNOCRouterRenderer links={noc1links} label="NOC1" />
                                    </div>
                                    <div className='col'>
                                        <div className='router'>
                                            <p className='label single-line'>Ethernet</p>
                                        </div>
                                        <DetailedViewPipeRenderer links={internalLinks} />
                                    </div>
                                </div>
                            </div>
                            <div className='off-chip'>
                                <div className='axi'>
                                    <p className='label single-line'>L1</p>
                                </div>
                            </div>
                        </div>
                        <div className='col eth-off-chip'>
                            <DetailedViewPipeRenderer links={internalLinks} className='centered-svg' />
                        </div>
                    </div>
                </div>
            </div>
            <div className='detailed-view-data'>
                <div className='node-links-wrap'>
                    {node.getInternalLinksForNode().map((link: NetworkLink) => {
                        return <LinkDetails key={link.name} link={link} showEmpty={false} />;
                    })}
                </div>
            </div>
        </>
    );
};

export default DetailedViewETHRenderer;
