// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC, useContext, useEffect, useState } from 'react';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import PopoverMenu from '../PopoverMenu';

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph: (graph: string) => Promise<void> | void;
    loadFirstGraphHandler?: (graph: string) => Promise<void> | void;
}

const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph, loadFirstGraphHandler }) => {
    const { getActiveGraphName, graphOnChipList } = useContext(GraphOnChipContext);
    const selectedGraph = getActiveGraphName();
    const availableGraphs = Object.keys(graphOnChipList);
    const [isLoadingGraph, setIsLoadingGraph] = useState(false);

    useEffect(() => {
        (async () => {
            if (loadFirstGraphHandler && !isLoadingGraph && !selectedGraph && availableGraphs?.length > 0) {
                setIsLoadingGraph(true);
                await loadFirstGraphHandler(availableGraphs[0]);
                setIsLoadingGraph(false);
            }
        })();
    }, [isLoadingGraph, selectedGraph, availableGraphs, loadFirstGraphHandler]);

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
    loadFirstGraphHandler: undefined,
};

export default GraphSelector;
