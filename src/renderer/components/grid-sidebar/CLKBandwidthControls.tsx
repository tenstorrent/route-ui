// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, Classes, Icon, NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import {
    updateCLK,
    updateChipTotalOps,
    updateDRAMBandwidth,
    updateEpochTotalOPs,
    updatePCIBandwidth,
} from 'data/store/slices/linkSaturation.slice';
import { FC, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type Location, useLocation } from 'react-router-dom';
import { DataIntegrityErrorType } from '../../../data/DataIntegrity';
import { AICLK_INITIAL_MHZ, DRAM_BANDWIDTH_INITIAL_GBS, PCIE_BANDWIDTH_INITIAL_GBS } from '../../../data/constants';
import Collapsible from '../Collapsible';

import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import {
    getCLKMhz,
    getDRAMBandwidth,
    getPCIBandwidth,
    getTotalOpsForChipId,
    getTotalOpsforTemporalEpoch,
} from '../../../data/store/selectors/linkSaturation.selectors';
import type { LocationState } from '../../../data/StateTypes';

interface DRAMBandwidthControlsProps {}

export const CLKBandwidthControls: FC<DRAMBandwidthControlsProps> = () => {
    const location: Location<LocationState> = useLocation();
    const { epoch, chipId } = location.state;

    const graphOnChipList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch, chipId);

    const dispatch = useDispatch();
    const dramBandwidth = useSelector(getDRAMBandwidth);
    const clkMHz = useSelector(getCLKMhz);
    const PCIeBandwidth = useSelector(getPCIBandwidth);
    const opCycles = useSelector(
        chipId !== undefined ? getTotalOpsForChipId(epoch, chipId) : getTotalOpsforTemporalEpoch(epoch),
    );
    const totalOpCycles = graphOnChipList.reduce(
        (totalOps, { graphOnChip }) => Math.max(totalOps, graphOnChip.totalOpCycles),
        1,
    );

    const aiclkRightElement = (
        <>
            <Tooltip2 content='Reset Total OP Cycles'>
                <Button
                    minimal
                    onClick={() => {
                        requestAnimationFrame(() => {
                            if (chipId !== undefined) {
                                dispatch(updateChipTotalOps({ temporalEpoch: epoch, chipId, totalOps: totalOpCycles }));
                            } else {
                                dispatch(updateEpochTotalOPs({ temporalEpoch: epoch, totalOps: totalOpCycles }));
                            }
                        });
                    }}
                    icon={IconNames.RESET}
                />
            </Tooltip2>
            {graphOnChipList.map(({ graphOnChip }) => {
                if (graphOnChip?.hasDataIntegrityError(DataIntegrityErrorType.TOTAL_OP_CYCLES_IS_ZERO)) {
                    return (
                        <Tooltip2 content='Cycles per input cannot be 0'>
                            <Icon icon={IconNames.WARNING_SIGN} className='warning-button' />
                        </Tooltip2>
                    );
                }

                return null;
            })}
        </>
    );

    return (
        <Collapsible label='CLK Controls' isOpen>
            <div>
                <label className={Classes.LABEL} htmlFor='opCyclesInput' style={{ marginBottom: '5px' }}>
                    AICLK cycles/input
                </label>
                <NumericInput
                    id='opCyclesInput'
                    value={opCycles}
                    stepSize={10000}
                    minorStepSize={100}
                    majorStepSize={100000}
                    min={1}
                    onValueChange={(value) => {
                        let newValue = value;

                        if (value === 0) {
                            newValue = 1;
                        }

                        if (Number.isNaN(value)) {
                            newValue = 1;
                        }

                        requestAnimationFrame(() => {
                            if (chipId !== undefined) {
                                dispatch(updateChipTotalOps({ temporalEpoch: epoch, chipId, totalOps: newValue }));
                            } else {
                                dispatch(updateEpochTotalOPs({ temporalEpoch: epoch, totalOps: newValue }));
                            }
                        });
                    }}
                    rightElement={aiclkRightElement}
                />
            </div>
            <hr />

            <label className={Classes.LABEL} htmlFor='clkMHzInput' style={{ marginBottom: '5px' }}>
                AICLK (MHz)
            </label>
            <NumericInput
                id='clkMHzInput'
                value={clkMHz}
                stepSize={10}
                minorStepSize={1}
                majorStepSize={100}
                min={1}
                onValueChange={(value) => {
                    let newValue = value;

                    if (value === 0) {
                        newValue = 1;
                    }

                    if (Number.isNaN(value)) {
                        newValue = 1;
                    }

                    requestAnimationFrame(() => dispatch(updateCLK(newValue)));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            requestAnimationFrame(() => dispatch(updateCLK(AICLK_INITIAL_MHZ)));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
            <br />

            <label className={Classes.LABEL} htmlFor='dramBandwidthInput' style={{ marginBottom: '5px' }}>
                DRAM channel BW (GB/s)
            </label>
            <NumericInput
                id='dramBandwidthInput'
                value={dramBandwidth}
                stepSize={0.5}
                minorStepSize={0.1}
                majorStepSize={10}
                min={0}
                onValueChange={(value) => {
                    let newValue = value;

                    if (Number.isNaN(value)) {
                        newValue = 0;
                    }

                    requestAnimationFrame(() => dispatch(updateDRAMBandwidth(newValue)));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            requestAnimationFrame(() => dispatch(updateDRAMBandwidth(DRAM_BANDWIDTH_INITIAL_GBS)));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
            <br />

            <label className={Classes.LABEL} htmlFor='pcieBandwidthInput' style={{ marginBottom: '5px' }}>
                PCIe channel BW (GB/s)
            </label>
            <NumericInput
                id='pcieBandwidthInput'
                value={PCIeBandwidth}
                stepSize={0.5}
                minorStepSize={0.1}
                majorStepSize={10}
                min={0}
                onValueChange={(value) => {
                    let newValue = value;

                    if (Number.isNaN(value)) {
                        newValue = 0;
                    }

                    requestAnimationFrame(() => dispatch(updatePCIBandwidth(newValue)));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            requestAnimationFrame(() => dispatch(updatePCIBandwidth(PCIE_BANDWIDTH_INITIAL_GBS)));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
        </Collapsible>
    );
};

export default CLKBandwidthControls;
