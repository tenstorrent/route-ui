// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { ChipDesignJSON } from './JSONDataTypes';
import { Architecture, ComputeNodeType, ComputeNodeTypeArch, Loc } from './Types';

export default class ChipDesign {
    public totalCols: number = 0;

    public totalRows: number = 0;

    public architecture: Architecture = Architecture.NONE;

    public nodes: ComputeNodeSimple[] = [];

    constructor(json: ChipDesignJSON, chipId: number = 0) {
        if (json.arch_name.toLowerCase().includes(Architecture.GRAYSKULL)) {
            this.architecture = Architecture.GRAYSKULL;
        }
        if (json.arch_name.toLowerCase().includes(Architecture.WORMHOLE)) {
            this.architecture = Architecture.WORMHOLE;
        }

        this.totalCols = json.grid.x_size - 1;
        this.totalRows = json.grid.y_size - 1;

        this.nodes.push(
            ...json.arc.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.CORE, loc, chipId);
            }),
            ...json.functional_workers.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.CORE, loc, chipId);
            }),
            ...json.dram
                .map((channel, dramChannelId) => {
                    return channel.map((loc, dramSubChannelId) => {
                        const core = new ComputeNodeSimple(ComputeNodeType.DRAM, loc, chipId);
                        core.dramChannelId = dramChannelId;
                        core.dramSubchannelId = dramSubChannelId;
                        return core;
                    });
                })
                .flat(),

            ...json.eth.map((loc, index) => {
                return new ComputeNodeSimple(ComputeNodeType.ETHERNET, loc, chipId, index);
            }),
            ...json.pcie.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.PCIE, loc, chipId);
            }),
            ...json.router_only.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.ROUTER, loc, chipId);
            }),
        );
        this.nodes = this.nodes.sort((a, b) => {
            if (a.loc.y !== b.loc.y) {
                return a.loc.y - b.loc.y;
            }
            return a.loc.x - b.loc.x;
        });
    }
}

export class ComputeNodeSimple {
    public type: ComputeNodeType;

    public loc: Loc = { x: 0, y: 0 };

    public dramChannelId: number = -1;

    public dramSubchannelId: number = 0;

    /** only applicable to concrete impelmentations */
    public uid = '';

    // TODO: shoudl only live on ETH type
    public ethId = 0;

    constructor(type: ComputeNodeType, location: string, chipId: number = 0, ethId: number = 0) {
        const [x = '-1', y = '-1'] = location.split('-');
        this.type = type;
        this.loc = { x: parseInt(x, 10), y: parseInt(y, 10) };
        this.uid = `${chipId}-${location}`; // TODO: consider passing constructed UID
        this.ethId = ethId;
    }
}

export function archToNodeType(key: string): ComputeNodeType {
    switch (key) {
        case ComputeNodeTypeArch.ARC:
        case ComputeNodeTypeArch.FUNCTIONAL_WORKERS:
            return ComputeNodeType.CORE;
        case ComputeNodeTypeArch.DRAM:
            return ComputeNodeType.DRAM;
        case ComputeNodeTypeArch.ETHERNET:
            return ComputeNodeType.ETHERNET;
        case ComputeNodeTypeArch.PCIE:
            return ComputeNodeType.PCIE;
        case ComputeNodeTypeArch.ROUTER:
            return ComputeNodeType.ROUTER;
        default:
            return ComputeNodeType.NONE;
    }
}
