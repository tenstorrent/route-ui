import { Button, Card, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { RootState } from 'data/store/createStore';
import { getArchitectureSelector, getDetailedViewZoom } from 'data/store/selectors/uiState.selectors';
import { closeDetailedView } from 'data/store/slices/detailedView.slice';
import React, { useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChipContext } from '../../data/ChipDataProvider';
import { ComputeNodeType } from '../../data/Types';
import { updateDetailedViewHeight } from '../../data/store/slices/uiState.slice';
import '../scss/DetailedView.scss';
import DetailedViewDRAMRenderer from './detailed-view-components/DetailedViewDRAM';
import DetailedViewETHRenderer from './detailed-view-components/DetailedViewETH';
import DetailedViewPCIERenderer from './detailed-view-components/DetailedViewPCIE';

interface DetailedViewProps {}

const DetailedView: React.FC<DetailedViewProps> = () => {
    const dispatch = useDispatch();
    const { getActiveChip, getGraphName } = useContext(ChipContext);
    const chip = getActiveChip();
    const graphName = getGraphName();
    const detailedViewElement = useRef<HTMLDivElement>(null);
    const zoom = useSelector(getDetailedViewZoom);

    const architecture = useSelector(getArchitectureSelector);
    const { isOpen, uid } = useSelector((state: RootState) => state.detailedView);
    const node = uid ? chip?.getNode(uid) : null;

    useEffect(() => {
        if (detailedViewElement.current) {
            const { marginBottom, height } = window.getComputedStyle(detailedViewElement.current);
            const parsedHeight = Number.parseFloat(height.replace('px', ''));
            const parsedMarginBottom = Number.parseFloat(marginBottom.replace('px', ''));

            dispatch(updateDetailedViewHeight((parsedHeight + parsedMarginBottom) * zoom));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, isOpen, node]);

    return (
        <Overlay isOpen={isOpen} enforceFocus={false} hasBackdrop={false} usePortal={false} transitionDuration={0}>
            <Card className='detailed-view-card'>
                <div className='detailed-view-container' style={{ zoom }} ref={detailedViewElement}>
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
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
