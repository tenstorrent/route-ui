// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC, useContext } from 'react';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import PopoverMenu from '../PopoverMenu';

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph: (graph: string) => void;
}

const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph }) => {
    const { getActiveGraphName, graphOnChipList } = useContext(GraphOnChipContext);
    const selectedGraph = getActiveGraphName();
    const availableGraphs = Object.keys(graphOnChipList);

    return (
        <PopoverMenu
            label={selectedGraph || (label ?? 'Select graph')}
            options={availableGraphs}
            selectedItem={selectedGraph}
            onSelectItem={(graph) => {
                onSelectGraph(graph);
            }}
            disabled={disabled || availableGraphs?.length === 0}
        />
    );
};

GraphSelector.defaultProps = {
    disabled: false,
    label: undefined,
};

export default GraphSelector;
