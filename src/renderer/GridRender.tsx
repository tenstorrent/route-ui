import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFocusPipe } from 'data/store/slices/pipeSelection.slice';
import { NODE_SIZE } from '../utils/DrawingAPI';

import NodeGridElement from './components/NodeGridElement';
import { ComputeNode } from '../data/Chip';
import DetailedView from './components/DetailedView';
import { mapIterable } from '../utils/IterableHelpers';
import { GridSidebar } from './components/grid-sidebar/GridSidebar';
import { getDetailedViewZoom, getGridZoom } from '../data/store/selectors/uiState.selectors';
import ClusterViewDialog from './components/cluster-view/ClusterViewDialog';
import { ChipContext } from '../data/ChipDataProvider';

export default function GridRender() {
    const gridZoom = useSelector(getGridZoom);
    const detailedViewZoom = useSelector(getDetailedViewZoom);
    const chip = useContext(ChipContext).getActiveChip();

    const dispatch = useDispatch();

    return (
        <>
            <GridSidebar />
            {chip && (
                <div
                    className='grid-container'
                    // this is to address the issue with focus pipe getting stuck because of Popover2
                    // TODO: find a better solution
                    onMouseEnter={() => {
                        dispatch(updateFocusPipe(null));
                    }}
                >
                    <div
                        className='node-container'
                        style={{
                            zoom: `${gridZoom}`,
                            gridTemplateColumns: `repeat(${chip.totalCols + 1}, ${NODE_SIZE}px)`,
                        }}
                    >
                        {[
                            ...mapIterable(chip.nodes, (node: ComputeNode) => {
                                return <NodeGridElement node={node} key={node.uid} />;
                            }),
                        ]}
                    </div>
                </div>
            )}
            <DetailedView zoom={detailedViewZoom} />
            <ClusterViewDialog zoom={1} />
        </>
    );
}
