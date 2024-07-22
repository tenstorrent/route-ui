// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { type FC } from 'react';
import { Operand } from '../../data/Graph';
import SelectableOperation from './SelectableOperation';
import useSelectableGraphVertex from '../hooks/useSelectableGraphVertex.hook';

interface GraphVertexDetailsSelectablesProps {
    operand: Operand;
    stringFilter?: string;
    showType?: boolean;
    isOffchip?: boolean;
    disabled?: boolean;
}

const GraphVertexDetailsSelectables: FC<GraphVertexDetailsSelectablesProps> = ({
    operand,
    stringFilter = '',
    showType = true,
    isOffchip,
    disabled = false,
}) => {
    const { selectOperand, selected, navigateToGraph } = useSelectableGraphVertex();

    return (
        <SelectableOperation
            opName={operand.name}
            value={selected(operand.name)}
            selectFunc={selectOperand}
            stringFilter={stringFilter}
            offchip={isOffchip}
            type={showType ? operand.vertexType : null}
            offchipClickHandler={navigateToGraph(operand.name)}
            disabled={disabled}
        />
    );
};

GraphVertexDetailsSelectables.defaultProps = {
    showType: true,
    stringFilter: '',
    isOffchip: undefined,
    disabled: undefined,
};

export default GraphVertexDetailsSelectables;
