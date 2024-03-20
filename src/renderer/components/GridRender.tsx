import { updateFocusPipe } from 'data/store/slices/pipeSelection.slice';
import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NODE_SIZE } from '../../utils/DrawingAPI';

import { ComputeNode } from '../../data/GraphOnChip';
import { GraphOnChipContext } from '../../data/GraphOnChipDataProvider';
import { getGridZoom } from '../../data/store/selectors/uiState.selectors';
import { mapIterable } from '../../utils/IterableHelpers';
import NodeGridElement from './NodeGridElement';
import ClusterViewDialog from './cluster-view/ClusterViewDialog';
import DetailedView from './detailed-view-components/DetailedView';

export default function GridRender() {
    const gridZoom = useSelector(getGridZoom);
    const graphOnChip = useContext(GraphOnChipContext).getActiveChip();

    const dispatch = useDispatch();

    return (
        <div className='main-content'>
            {graphOnChip && (
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
                            gridTemplateColumns: `repeat(${graphOnChip.totalCols + 1}, ${NODE_SIZE}px)`,
                        }}
                    >
                        {[
                            ...mapIterable(graphOnChip.nodes, (node: ComputeNode) => {
                                return <NodeGridElement node={node} key={node.uid} />;
                            }),
                        ]}
                    </div>
                </div>
            )}
            <DetailedView />
            <ClusterViewDialog />
        </div>
    );
}
