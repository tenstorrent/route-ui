// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import React, { useContext } from 'react';
import { Operand } from '../../data/Graph';
import SelectableOperation from './SelectableOperation';
import useSelectableGraphVertex from '../hooks/useSelectableGraphVertex.hook';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';

const GraphVertexDetailsSelectables = (props: {
    operand: Operand,
    stringFilter?: string,
    displayType?: boolean

}): React.ReactElement | null => {
    const { operand, stringFilter = '', displayType = true } = props;
    const { selectOperand, selected } = useSelectableGraphVertex();
    const { getOperand } = useContext(GraphOnChipContext);
    const { loadPerfAnalyzerGraph } = usePerfAnalyzerFileLoader();
    const operandDescriptor = getOperand(operand.name);

    return <SelectableOperation
        opName={operand.name}
        value={selected(operand.name)}
        selectFunc={selectOperand}
        stringFilter={stringFilter}
        offchip={operand.isOffchip}
        type={displayType ? operand.vertexType : null}
        offchipClickHandler={() => loadPerfAnalyzerGraph(operandDescriptor?.graphName ?? '')}
    />;
};

GraphVertexDetailsSelectables.defaultProps = {
    displayType: true,
    stringFilter: '',
};

export default GraphVertexDetailsSelectables;
