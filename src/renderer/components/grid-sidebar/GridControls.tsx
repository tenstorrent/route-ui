import { FC } from 'react';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Position, Switch } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import Collapsible from '../Collapsible';
import {
    getShowEmptyLinks,
    getShowNodeLocation,
    getShowOperationColors,
} from '../../../data/store/selectors/uiState.selectors';
import {
    updateShowEmptyLinks,
    updateShowNodeLocation,
    updateShowOperationColors,
} from '../../../data/store/slices/uiState.slice';

export const GridControls: FC = () => {
    const dispatch = useDispatch();

    const showEmptyLinks = useSelector(getShowEmptyLinks);
    const showOperationColors = useSelector(getShowOperationColors);
    const showNodeLocation = useSelector(getShowNodeLocation);

    return (
        <Collapsible
            contentStyles={{
                display: 'flex',
                flexDirection: 'column',
            }}
            label='Grid Controls'
            isOpen={false}
        >
            <>
                <Tooltip2 content='Show all links overlay' position={Position.RIGHT}>
                    <Switch
                        checked={showEmptyLinks}
                        label='links'
                        onChange={(event) => dispatch(updateShowEmptyLinks(event.currentTarget.checked))}
                    />
                </Tooltip2>
                <Tooltip2 content='Show all operations colors' position={Position.RIGHT}>
                    <Switch
                        checked={showOperationColors}
                        label='operations'
                        onChange={(event) => dispatch(updateShowOperationColors(event.currentTarget.checked))}
                    />
                </Tooltip2>
                <Tooltip2 content='Show Compute Node locations' position={Position.RIGHT}>
                    <Switch
                        checked={showNodeLocation}
                        label='location'
                        onChange={(event) => dispatch(updateShowNodeLocation(event.currentTarget.checked))}
                    />
                </Tooltip2>
                <hr />
            </>
        </Collapsible>
    );
};

export default GridControls;
