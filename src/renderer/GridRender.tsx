import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFocusPipe } from 'data/store/slices/pipeSelection.slice';

import DataSource, { GridContext } from '../data/DataSource';
import { NODE_SIZE } from '../utils/DrawingAPI';

import NodeGridElement from './components/NodeGridElement';
import { ComputeNode } from '../data/Chip';
import DetailedView from './components/DetailedView';
import { mapIterable } from '../utils/IterableHelpers';
import { GridSidebar } from './components/grid-sidebar/GridSidebar';
import { getDetailedViewZoom, getGridZoom } from '../data/store/selectors/uiState.selectors';

export default function GridRender() {
    const { chip } = useContext<GridContext>(DataSource);
    const gridZoom = useSelector(getGridZoom);
    const detailedViewZoom = useSelector(getDetailedViewZoom);

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
        </>
    );
}
