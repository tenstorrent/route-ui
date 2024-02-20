import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slider } from '@blueprintjs/core';
import Collapsible from '../Collapsible';
import type { RootState } from '../../../data/store/createStore';
import { getOperationRatioThreshold } from '../../../data/store/selectors/operationPerf.selectors';
import { updateOperationRatioThreshold } from '../../../data/store/slices/operationPerf.slice';

const ModelControls: FC = () => {
    const dispatch = useDispatch();
    const opperationRatioThreshold = useSelector((state: RootState) => getOperationRatioThreshold(state));

    return (
        <Collapsible
            contentStyles={{
                display: 'flex',
                flexDirection: 'column',
            }}
            label='Model Estimate Controls'
            isOpen={false}
        >
            <Slider
                min={0}
                max={10}
                labelStepSize={1}
                value={opperationRatioThreshold}
                onChange={(value: number) => dispatch(updateOperationRatioThreshold(value))}
                labelRenderer={(value) => `${value.toFixed(0)}`}
            />
        </Collapsible>
    );
};

export default ModelControls;
