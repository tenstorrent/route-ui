import React from 'react';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useDispatch } from 'react-redux';
import { ComputeNode } from '../../../data/Chip';
import { updatePipeSelection } from '../../../data/store';

interface DetailedViewPipeControlsProps {
    node: ComputeNode | undefined;
    numPipes: number;
}

const DetailedViewPipeControls: React.FC<DetailedViewPipeControlsProps> = ({ node, numPipes }) => {
    const dispatch = useDispatch();
    const changePipeState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({ id: pipeId, selected: state }));
        });
    };
    if (!node) {
        return null;
    }
    return (
        <div className='controls-wrap'>
            <Button
                className='pipe-selection'
                small
                icon={IconNames.FILTER_LIST}
                disabled={numPipes === 0}
                onClick={() => {
                    changePipeState(node?.getInternalPipeIDsForNode() || [], true);
                }}
            />
            <Button
                className='pipe-selection'
                small
                icon={IconNames.FILTER_REMOVE}
                disabled={numPipes === 0}
                onClick={() => {
                    changePipeState(node?.getInternalPipeIDsForNode() || [], false);
                }}
            />
        </div>
    );
};

export default DetailedViewPipeControls;
