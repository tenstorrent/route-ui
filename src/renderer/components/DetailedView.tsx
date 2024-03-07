import { Button, Card, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { RootState } from 'data/store/createStore';
import { getArchitectureSelector } from 'data/store/selectors/uiState.selectors';
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

interface DetailedViewProps {
    zoom: number;
}

const DetailedView: React.FC<DetailedViewProps> = ({ zoom }) => {
    const dispatch = useDispatch();
    const chip = useContext(ChipContext).getActiveChip();
    const detailedViewElement = useRef<HTMLDivElement>(null);

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
                <div style={{ zoom }} ref={detailedViewElement}>
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
                            {node.type === ComputeNodeType.PCIE && <DetailedViewPCIERenderer node={node} />}
                        </div>
                    )}
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
