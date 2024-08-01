// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { type FC } from 'react';
import { type Location, useLocation } from 'react-router-dom';
import { Operand } from '../../data/Graph';
import SelectableOperation from './SelectableOperation';
import useSelectableGraphVertex from '../hooks/useSelectableGraphVertex.hook';
import type { LocationState } from '../../data/StateTypes';

interface GraphVertexDetailsSelectableProps {
    operand: Operand;
    stringFilter?: string;
    showType?: boolean;
    disabled?: boolean;
}

const GraphVertexDetailsSelectable: FC<GraphVertexDetailsSelectableProps> = ({
    operand,
    stringFilter = '',
    showType = true,
    disabled = false,
}) => {
    const { selectOperand, selected, navigateToGraph } = useSelectableGraphVertex();
    const location: Location<LocationState> = useLocation();
    const { chipId } = location.state;

    return (
        <SelectableOperation
            opName={operand.name}
            value={selected(operand.name)}
            selectFunc={selectOperand}
            stringFilter={stringFilter}
            offchip={operand.isOffchip(chipId)}
            type={showType ? operand.vertexType : null}
            offchipClickHandler={navigateToGraph(operand.name)}
            disabled={disabled}
        />
    );
};

GraphVertexDetailsSelectable.defaultProps = {
    showType: true,
    stringFilter: '',
    disabled: undefined,
};

export default GraphVertexDetailsSelectable;
