import Chip, {ComputeNode} from './DataStructures';
import {NetlistAnalyzerDataJSON, NodeDataJSON} from './JSONDataTypes';
import ChipDesign, {ChipDesignJSON} from './ChipDesign';

export default class GridDataGenerator {
    public static generateGridData(json: NetlistAnalyzerDataJSON): Chip {
        // return new GridData(json);
    }

    constructor() {
        console.log('GridDataGenerator');
    }
}

export class ChipDesignGenerator {
    public static generateChipDesign(json: ChipDesignJSON): ChipDesign {
        return new ChipDesign(json);
    }

    public static computeNodeFRomJSON(json: NodeDataJSON, uid: string): ComputeNode {
        const node = new ComputeNode(uid);
        node.fromNetlistJSON(json);
        return node;
    }

    constructor() {
        console.log('ChipDesignGenerator');
    }
}
