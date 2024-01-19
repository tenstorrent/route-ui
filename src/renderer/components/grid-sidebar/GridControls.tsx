import { FC } from 'react';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Position, Switch } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import Collapsible from '../Collapsible';
import {
    getShowEmptyLinks,
    getShowNodeLocation,
    getShowOperationNames,
} from '../../../data/store/selectors/uiState.selectors';
import {
    updateShowEmptyLinks,
    updateShowNodeLocation,
    updateShowOperationNames,
} from '../../../data/store/slices/uiState.slice';

export const GridControls: FC = () => {
    const dispatch = useDispatch();

    const showEmptyLinks = useSelector(getShowEmptyLinks);
    const showOperationNames = useSelector(getShowOperationNames);
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
                <Tooltip2 content='Show all selected operation labels' position={Position.RIGHT}>
                    <Switch
                        checked={showOperationNames}
                        label='operation labels'
                        onChange={(event) => dispatch(updateShowOperationNames(event.currentTarget.checked))}
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
