// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC, useContext, useState } from 'react';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import PopoverMenu from '../PopoverMenu';

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph: (graph: string) => Promise<void> | void;
}

const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph }) => {
    const { getActiveGraphName, graphOnChipList } = useContext(GraphOnChipContext);
    const selectedGraph = getActiveGraphName();
    const availableGraphs = Object.keys(graphOnChipList);
    const [isLoadingGraph, setIsLoadingGraph] = useState(false);

    return (
        <PopoverMenu
            label={selectedGraph || (label ?? 'Select graph')}
            options={availableGraphs}
            selectedItem={selectedGraph}
            onSelectItem={async (graph) => {
                await onSelectGraph(graph);
            }}
            disabled={disabled || isLoadingGraph || availableGraphs?.length === 0}
            loading={isLoadingGraph}
        />
    );
};

GraphSelector.defaultProps = {
    disabled: false,
    label: undefined,
};

export default GraphSelector;
