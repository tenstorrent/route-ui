import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { closeDetailedView } from 'data/store/slices/detailedView.slice';
import { RootState } from 'data/store/createStore';
import { getArchitectureSelector } from 'data/store/selectors/uiState.selectors';
import '../scss/DetailedView.scss';
import { ComputeNodeType } from '../../data/Types';
import DetailedViewDRAMRenderer from './detailed-view-components/DetailedViewDRAM';
import DetailedViewETHRenderer from './detailed-view-components/DetailedViewETH';
import DetailedViewPCIERenderer from './detailed-view-components/DetailedViewPCIE';
import { ChipContext } from '../../data/ChipDataProvider';

interface DetailedViewProps {
    zoom: number;
}

const DetailedView: React.FC<DetailedViewProps> = ({ zoom }) => {
    const dispatch = useDispatch();
    const { getActiveChip, getGraphName } = useContext(ChipContext);
    const chip = getActiveChip();
    const graphName = getGraphName();
    const architecture = useSelector(getArchitectureSelector);
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
                        {node.type === ComputeNodeType.DRAM && (
                            <DetailedViewDRAMRenderer graphName={graphName} node={node} />
                        )}
                        {node.type === ComputeNodeType.ETHERNET && (
                            <DetailedViewETHRenderer graphName={graphName} node={node} />
                        )}
                        {node.type === ComputeNodeType.PCIE && (
                            <DetailedViewPCIERenderer graphName={graphName} node={node} />
                        )}
                    </div>
                )}
            </Card>
        </Overlay>
    );
};
export default DetailedView;
