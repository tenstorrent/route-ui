import React from 'react';
import { NetworkLink, NOCLink } from '../../../data/Chip';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';

interface DetailedViewNOCRouterRendererProps {
    links: NetworkLink[];
    label: string;
    className?: string;
}

const DetailedViewNOCRouterRenderer: React.FC<DetailedViewNOCRouterRendererProps> = ({ links, label, className }) => {
    return (
        <>
            <div className='router'>
                <p className={`label ${className}`}>
                    {label}
                    <br />
                    Router
                </p>
            </div>
            <DetailedViewPipeRenderer links={links} />
        </>
    );
};

DetailedViewNOCRouterRenderer.defaultProps = {
    className: '',
};
export default DetailedViewNOCRouterRenderer;
