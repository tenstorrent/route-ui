/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import React from 'react';
import { Operand } from '../../data/Graph';
import SelectableOperation from './SelectableOperation';
import { GraphVertexType } from '../../data/GraphNames';
import useSelectableGraphVertex from '../hooks/useSelectableGraphVertex.hook';

const GraphVertexDetailsSelectables = (props: { operand: Operand }): React.ReactElement | null => {
    const { operand } = props;
    const { selected, selectQueue, selectOperation, disabledQueue } = useSelectableGraphVertex();
    return operand.vertexType === GraphVertexType.OPERATION ? (
        <SelectableOperation
            opName={operand.name}
            value={selected(operand.name)}
            selectFunc={selectOperation}
            stringFilter=''
            type={operand.vertexType}
        />
    ) : (
        <SelectableOperation
            disabled={disabledQueue(operand.name)}
            opName={operand.name}
            value={selected(operand.name)}
            selectFunc={selectQueue}
            stringFilter=''
            type={operand.vertexType}
        />
    );
};

export default GraphVertexDetailsSelectables;
