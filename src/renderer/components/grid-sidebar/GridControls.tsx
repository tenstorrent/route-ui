// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import { Position, Switch } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getShowEmptyLinks,
    getShowNodeUID,
    getShowOperationNames,
} from '../../../data/store/selectors/uiState.selectors';
import {
    updateShowEmptyLinks,
    updateShowNodeUID,
    updateShowOperationNames,
} from '../../../data/store/slices/uiState.slice';
import Collapsible from '../Collapsible';

import './GridControls.scss';

export const GridControls: FC = () => {
    const dispatch = useDispatch();

    const showEmptyLinks = useSelector(getShowEmptyLinks);
    const showOperationNames = useSelector(getShowOperationNames);
    const showNodeLocation = useSelector(getShowNodeUID);

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
                        onChange={(event) => dispatch(updateShowNodeUID(event.currentTarget.checked))}
                    />
                </Tooltip2>
                <hr />
            </>
        </Collapsible>
    );
};

export default GridControls;
