import { Slider } from '@blueprintjs/core';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDetailedViewZoom, updateGridZoom } from '../../../data/store/slices/uiState.slice';
import { getDetailedViewZoom, getGridZoom } from '../../../data/store/selectors/uiState.selectors';

export const ZoomControls: FC = () => {
    const dispatch = useDispatch();

    const detailedViewZoom = useSelector(getDetailedViewZoom);
    const gridZoom = useSelector(getGridZoom);

    return (
        <>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor='detailedViewZoom'>Detailed view zoom</label>
            <Slider
                id='detailedViewZoom'
                min={0.5}
                max={1}
                stepSize={0.1}
                labelStepSize={1}
                value={detailedViewZoom}
                onChange={(value: number) => dispatch(updateDetailedViewZoom(value))}
                labelRenderer={(value) => `${value.toFixed(1)}`}
            />

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor='gridZoom'>Zoom</label>
            <Slider
                min={0.5}
                max={3}
                id='gridZoom'
                stepSize={0.25}
                labelStepSize={1}
                value={gridZoom}
                onChange={(value: number) => dispatch(updateGridZoom(value))}
                labelRenderer={(value) => `${value.toFixed(1)}`}
            />
        </>
    );
};

export default ZoomControls;
