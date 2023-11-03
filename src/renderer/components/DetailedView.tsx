import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { closeDetailedView, RootState } from '../../data/store';
import DataSource, { GridContext } from '../../data/DataSource';
import '../scss/DetailedView.scss';
import { ComputeNodeType } from '../../data/Types';
import DetailedViewDRAMRenderer from './detailed-view-components/DetailedViewDRAM';
import DetailedViewETHRenderer from './detailed-view-components/DetailedViewETH';

interface DetailedViewProps {
    zoom: number;
}

const DetailedView: React.FC<DetailedViewProps> = ({ zoom }) => {
    const dispatch = useDispatch();
    const { chip } = useContext<GridContext>(DataSource);
    const architecture = useSelector((state: RootState) => state.nodeSelection.architecture);
    const { isOpen, uid } = useSelector((state: RootState) => state.detailedView);
    const node = uid ? chip?.getNode(uid) : null;

    return (
        <Overlay isOpen={isOpen} enforceFocus={false} hasBackdrop={false} usePortal={false}>
            <Card className='detailed-view-card' style={{ zoom }}>
                <div className='detailed-view-header'>
                    {node && (
                        <h3>
                            {node.type} {node.loc.x},{node.loc.y}
                        </h3>
                    )}
                    <Button small icon={IconNames.CROSS} onClick={() => dispatch(closeDetailedView())} />
                </div>
                {node && (
                    <div className={`detailed-view-wrap arch-${architecture} type-${node.type}`}>
                        {node.type === ComputeNodeType.DRAM && <DetailedViewDRAMRenderer node={node} />}
                        {node.type === ComputeNodeType.ETHERNET && <DetailedViewETHRenderer node={node} />}
                    </div>
                )}
            </Card>
        </Overlay>
    );
};
export default DetailedView;
