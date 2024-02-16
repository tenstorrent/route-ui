import { Button, Classes, Icon, NumericInput } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import { FC, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
    updateTotalOPs,
} from 'data/store/slices/linkSaturation.slice';
import { RootState } from '../../../data/store/createStore';
import { AICLK_INITIAL_MHZ, DRAM_BANDWIDTH_INITIAL_GBS, PCIE_BANDWIDTH_INITIAL_GBS } from '../../../data/constants';
import Collapsible from '../Collapsible';
import { DataIntegrityErrorType } from '../../../data/DataIntegrity';

import '../../scss/GridControls.scss';
import { ChipContext } from '../../../data/ChipDataProvider';

interface DRAMBandwidthControlsProps {}

export const CLKBandwidthControls: FC<DRAMBandwidthControlsProps> = () => {
    const chip = useContext(ChipContext).getActiveChip();
    const dispatch = useDispatch();
    const dramBandwidth = useSelector((state: RootState) => state.linkSaturation.DRAMBandwidthGBs);
    const clkMHz = useSelector((state: RootState) => state.linkSaturation.CLKMHz);
    const PCIeBandwidth = useSelector((state: RootState) => state.linkSaturation.PCIBandwidthGBs);
    const opCycles = useSelector((state: RootState) => state.linkSaturation.totalOps);

    let aiclkRightElement = (
        <Tooltip2 content='Reset Total OP Cycles'>
            <Button
                minimal
                onClick={() => {
                    const resetValue = chip?.totalOpCycles || 1;

                    dispatch(updateTotalOPs(resetValue));
                }}
                icon={IconNames.RESET}
            />
        </Tooltip2>
    );

    if (chip?.hasDataIntegrityError(DataIntegrityErrorType.TOTAL_OP_CYCLES_IS_ZERO)) {
        aiclkRightElement = (
            <Tooltip2 content='Cycles per input cannot be 0'>
                <Icon icon={IconNames.WARNING_SIGN} className='warning-button' />
            </Tooltip2>
        );
    }

    return (
        <Collapsible label='CLK Controls' isOpen>
            <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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

                        dispatch(updateTotalOPs(newValue));
                    }}
                    rightElement={aiclkRightElement}
                />
            </div>
            <hr />

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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

                    dispatch(updateCLK(newValue));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            dispatch(updateCLK(AICLK_INITIAL_MHZ));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
            <br />

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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

                    dispatch(updateDRAMBandwidth(newValue));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            dispatch(updateDRAMBandwidth(DRAM_BANDWIDTH_INITIAL_GBS));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
            <br />

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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

                    dispatch(updatePCIBandwidth(newValue));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            dispatch(updatePCIBandwidth(PCIE_BANDWIDTH_INITIAL_GBS));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
        </Collapsible>
    );
};

export default CLKBandwidthControls;
