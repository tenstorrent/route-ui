// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Tooltip2 } from '@blueprintjs/popover2';
import { Position, Slider, Switch } from '@blueprintjs/core';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateLinkSaturation,
    updateShowLinkSaturation,
    updateShowNOC,
} from '../../../data/store/slices/linkSaturation.slice';
import { NOC } from '../../../data/Types';
import {
    getLinkSaturation,
    getShowLinkSaturation,
    getShowNOC0,
    getShowNOC1,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { calculateLinkCongestionColor } from '../../../utils/DrawingAPI';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';

interface LinkCongestionControlsProps {
    showNOCControls?: boolean;
}

const LinkCongestionControls: FC<LinkCongestionControlsProps> = ({ showNOCControls = true }) => {
    const dispatch = useDispatch();
    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const showNOC0 = useSelector(getShowNOC0);
    const showNOC1 = useSelector(getShowNOC1);
    const isHC: boolean = useSelector(getHighContrastState);
    const congestionLegendStyle = {
        background: `linear-gradient(to right, ${calculateLinkCongestionColor(
            0,
            0,
            isHC,
        )}, ${calculateLinkCongestionColor(50, 0, isHC)}, ${calculateLinkCongestionColor(120, 0, isHC)})`,
    };
    return (
        <>
            {/* Link saturation */}
            <Tooltip2 content='Show link congestion' position={Position.RIGHT}>
                <Switch
                    checked={showLinkSaturation}
                    label='link congestion'
                    onChange={(event) => dispatch(updateShowLinkSaturation(event.currentTarget.checked))}
                />
            </Tooltip2>
            {showNOCControls && (
                <>
                    <Switch
                        disabled={!showLinkSaturation}
                        checked={showNOC0}
                        label='noc0'
                        onChange={(event) =>
                            dispatch(
                                updateShowNOC({
                                    noc: NOC.NOC0,
                                    selected: event.currentTarget.checked,
                                }),
                            )
                        }
                    />
                    <Switch
                        disabled={!showLinkSaturation}
                        checked={showNOC1}
                        label='noc1'
                        onChange={(event) =>
                            dispatch(
                                updateShowNOC({
                                    noc: NOC.NOC1,
                                    selected: event.currentTarget.checked,
                                }),
                            )
                        }
                    />
                </>
            )}
            <div className='congestion-legend' style={{ ...(showLinkSaturation ? congestionLegendStyle : null) }} />
            <Slider
                className='link-saturation-slider'
                min={0}
                max={125}
                disabled={!showLinkSaturation}
                labelStepSize={50}
                value={linkSaturationTreshold}
                onChange={(value: number) => requestAnimationFrame(() => dispatch(updateLinkSaturation(value)))}
                labelRenderer={(value) => `${value.toFixed(0)}`}
            />
        </>
    );
};
LinkCongestionControls.defaultProps = {
    showNOCControls: true,
};

export default LinkCongestionControls;
