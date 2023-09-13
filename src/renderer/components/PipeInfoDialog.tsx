import React, {FC, useContext, useEffect, useState} from 'react';
import {Tooltip2} from '@blueprintjs/popover2';
import {JSX} from 'react/jsx-runtime';
import {useDispatch} from 'react-redux';
import DataSource from '../../data/DataSource';
import {HighlightType, resetCoreHighlight, updateCoreHighlight, updateFocusPipeSelection} from '../../data/store';

export interface PipeInfoDialogProps {
    contents: React.ReactNode;
    pipeId: string;
}

/**
 * PipeInfoDialog
 * @param contents
 * @param pipeId
 * @constructor
 * @description This wrapper component is used to display information about a pipe when the user hovers over it
 */
const PipeInfoDialog: FC<PipeInfoDialogProps> = ({contents, pipeId}) => {
    const [tooltipContent, setTooltipContent] = useState<JSX.Element | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const {gridData} = useContext(DataSource);
    const [nodeHighlightInputs, setNodeHighlightInputs] = useState<string[]>([]);
    const [nodeHighlightOutputs, setNodeHighlightOutputs] = useState<string[]>([]);
    const dispatch = useDispatch();
    const setupData = () => {
        let inputCores: string[] = [];
        let outputCores: string[] = [];
        const inputOps: Map<string, string[]> = new Map<string, []>();
        const outputOps: Map<string, string[]> = new Map<string, []>();
        const data = gridData?.getPipeInfo(pipeId);
        if (data) {
            data.forEach((nodeData) => {
                const {opName, uid} = nodeData;
                if (nodeData.coreOpertaionData) {
                    nodeData.coreOpertaionData.inputs.forEach((input) => {
                        let hasPipe = false;
                        input.pipeOperations.forEach((pipeOpList) => {
                            if (pipeOpList.pipeIDs.includes(pipeId)) {
                                hasPipe = true;
                            }
                        });
                        if (hasPipe) {
                            if (!outputOps.has(opName)) {
                                outputOps.set(opName, []);
                            }
                            outputCores.push(uid);
                            outputOps.get(opName)?.push(input.name);
                        }
                    });
                    nodeData.coreOpertaionData.outputs.forEach((output) => {
                        let hasPipe = false;
                        output.pipeOperations.forEach((pipeOpList) => {
                            if (pipeOpList.pipeIDs.includes(pipeId)) {
                                hasPipe = true;
                            }
                        });
                        if (hasPipe) {
                            if (!inputOps.has(opName)) {
                                inputOps.set(opName, []);
                            }
                            inputCores.push(uid);
                            inputOps.get(opName)?.push(output.name);
                        }
                    });
                }
            });
        }

        inputCores = [...new Set(inputCores)];
        outputCores = [...new Set(outputCores)];
        const out: JSX.Element[] = [];
        if (inputCores.length > 0 || outputCores.length > 0) {
            if (inputOps.size > 0) {
                inputOps.forEach((inputs, opName) => {
                    const io = [...new Set(inputs)];
                    out.push(
                        <div style={{marginBottom: '10px'}}>
                            <h3>Inputs:</h3>
                            <h2>{opName}</h2>
                            {io.length > 0 && (
                                <div>
                                    {io.map((input) => {
                                        return (
                                            <h4 key={input} style={{marginLeft: '10px'}}>
                                                {input}
                                            </h4>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                });
            }
            if (outputOps.size > 0) {
                outputOps.forEach((outputs, opName) => {
                    const io = [...new Set(outputs)];
                    out.push(
                        <div style={{marginBottom: '10px'}}>
                            <h3>Outputs:</h3>
                            <h2>{opName}</h2>
                            {io.length > 0 && (
                                <div>
                                    {io.map((ouput) => {
                                        return (
                                            <h4 key={ouput} style={{marginLeft: '10px'}}>
                                                {ouput}
                                            </h4>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                });
            }
            dispatch(resetCoreHighlight());
            dispatch(updateCoreHighlight({ids: inputCores, selected: HighlightType.INPUT}));
            dispatch(updateCoreHighlight({ids: outputCores, selected: HighlightType.OUTPUT}));

            setNodeHighlightInputs(inputCores);
            setNodeHighlightOutputs(outputCores);
        }

        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{out}</>;
    };

    const highlightCores = () => {
        dispatch(resetCoreHighlight());

        dispatch(updateCoreHighlight({ids: nodeHighlightInputs, selected: HighlightType.INPUT}));
        dispatch(updateCoreHighlight({ids: nodeHighlightOutputs, selected: HighlightType.OUTPUT}));
    };

    if (shouldRender) {
        setTooltipContent(setupData());
        setShouldRender(false);
    }

    useEffect(() => {
        setTooltipContent(null);
        setShouldRender(true);

    }, [gridData]);

    return (
        <Tooltip2 usePortal={false} content={tooltipContent || <span>Loading...</span>}>
            <div
                className="pipe-info-dialog"
                onMouseLeave={() => {
                    dispatch(updateFocusPipeSelection({id: pipeId, selected: false}));
                    dispatch(resetCoreHighlight());
                }}
                onFocus={() => {
                    if (!tooltipContent) {
                        setShouldRender(true);
                    } else {
                        highlightCores();
                    }
                    dispatch(updateFocusPipeSelection({id: pipeId, selected: true}));
                }}
                onMouseEnter={() => {
                    if (!tooltipContent) {
                        setShouldRender(true);
                    } else {
                        highlightCores();
                    }
                    dispatch(updateFocusPipeSelection({id: pipeId, selected: true}));
                }}
            >
                {contents}
            </div>
        </Tooltip2>
    );
};

export default PipeInfoDialog;
