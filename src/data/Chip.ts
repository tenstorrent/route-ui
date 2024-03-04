/* eslint-disable no-useless-constructor */
import {
    ChipDesignJSON,
    DramChannelJSON,
    NetlistAnalyzerDataJSON,
    NOCLinkJSON,
    NodeDataJSON,
    OperationDataJSON,
} from './JSONDataTypes';
import { BuildableOperation, BuildableQueue, Operand } from './Graph';
import ChipDesign from './ChipDesign';
import { ComputeNodeState, LinkState, PipeSelection } from './StateTypes';
import {
    Architecture,
    ComputeNodeType,
    DRAMBank,
    DramBankLinkName,
    EthernetLinkName,
    LinkType,
    Loc,
    NetworkLinkName,
    NOC,
    NOC2AXILinkName,
    NOCLinkName,
    PCIeLinkName,
    QueueLocation,
} from './Types';
import { INTERNAL_LINK_NAMES, INTERNAL_NOC_LINK_NAMES } from './constants';
import type { Operation, Queue } from './GraphTypes';
import { GraphVertex } from './GraphTypes';
import { filterIterable, forEach, mapIterable } from '../utils/IterableHelpers';
import {
    aggregateCoresByOperation,
    GraphDescriptorJSON,
    OperandJSON,
    OperationDescription,
} from './sources/GraphDescriptor';
import { parsedQueueLocation, QueueDescriptorJson } from './sources/QueueDescriptor';
import { OpPerformanceByOp, PerfAnalyzerResultsJson } from './sources/PerfAnalyzerResults';
import { MeasurementDetails, OpPerfDetails } from './OpPerfDetails';
import { GraphVertexType, OperationName, QueueName } from './GraphNames';
import { DataIntegrityError, DataIntegrityErrorType } from './DataIntegrity';

export default class Chip {
    private static NOC_ORDER: Map<NOCLinkName, number>;

    public static GET_NOC_ORDER(): Map<NOCLinkName, number> {
        if (!Chip.NOC_ORDER) {
            Chip.NOC_ORDER = new Map(
                (Object.keys(NOCLinkName) as Array<keyof typeof NOCLinkName>)
                    .map((key) => NOCLinkName[key])
                    .map((noc, index) => [noc, index]),
            );
        }

        return Chip.NOC_ORDER;
    }

    readonly chipId: number;

    private nodesById: Map<string, ComputeNode> = new Map();

    private nodeByChannelId: Map<number, ComputeNode[]> = new Map();

    public get nodes(): Iterable<ComputeNode> {
        return this.nodesById.values();
    }

    protected set nodes(value: Iterable<ComputeNode>) {
        this.nodesById = new Map(mapIterable(value, (node: ComputeNode) => [node.uid, node]));
        [...this.nodesById.values()].forEach((node) => {
            const channelId = node.dramChannelId;
            if (channelId > -1) {
                this.nodeByChannelId.set(channelId, [...(this.nodeByChannelId.get(channelId) || []), node]);
            }
        });
    }

    public getNode(nodeUID: string): ComputeNode {
        const node = this.nodesById.get(nodeUID);
        if (!node) {
            throw new Error(`Node ${nodeUID} does not exist on chip ${this.chipId}`);
        }
        return node;
    }

    public getNodeByChannelId(id: number): ComputeNode[] {
        return this.nodeByChannelId.get(id) || [];
    }

    private _totalCols: number = 0;

    public get totalCols(): number {
        return this._totalCols;
    }

    protected set totalCols(value: number) {
        this._totalCols = value;
    }

    private _totalRows: number = 0;

    public get totalRows(): number {
        return this._totalRows;
    }

    protected set totalRows(value: number) {
        this._totalRows = value;
    }

    private _slowestOpCycles: number = 0;

    public get slowestOpCycles(): number {
        return this._slowestOpCycles;
    }

    protected set slowestOpCycles(value: number) {
        this._slowestOpCycles = value;
    }

    private _bwLimitedOpCycles: number = 0;

    public get bwLimitedOpCycles(): number {
        return this._bwLimitedOpCycles;
    }

    protected set bwLimitedOpCycles(value: number) {
        this._bwLimitedOpCycles = value;
    }

    private _architecture: Architecture = Architecture.NONE;

    public get architecture(): Architecture {
        return this._architecture;
    }

    protected set architecture(value: Architecture) {
        this._architecture = value;
    }

    private uniquePipeSegmentList: PipeSegment[] = [];

    private _dramChannels: DramChannel[] = [];

    public get dramChannels(): DramChannel[] {
        return this._dramChannels;
    }

    protected set dramChannels(value: DramChannel[]) {
        this._dramChannels = value;
    }

    private _totalOpCycles: number = 0;

    public get totalOpCycles(): number {
        return this._totalOpCycles;
    }

    protected set totalOpCycles(value: number) {
        this._totalOpCycles = value;
    }

    /**
     * Iterates over all operations.
     */
    public get operations(): Iterable<Operation> {
        return this.operationsByName.values();
    }

    private operationsByName: Map<OperationName, BuildableOperation>;

    public getOperation(name: OperationName) {
        return this.operationsByName.get(name);
    }

    protected addOperation(operation: BuildableOperation) {
        if (!this.operationsByName.has(operation.name)) {
            this.operationsByName.set(operation.name, operation);
        } else {
            console.warn('Operation already exists', operation.name);
        }
    }

    protected updateOperation(operation: BuildableOperation) {
        if (!this.operationsByName.has(operation.name)) {
            this.operationsByName.set(operation.name, operation);
        } else {
            const existingOperation = this.operationsByName.get(operation.name);
            if (existingOperation) {
                existingOperation.assignInputs(operation.inputs);
                existingOperation.assignOutputs(operation.outputs);
                existingOperation.pipeIdsByCore = operation.pipeIdsByCore;
            }
        }
    }

    private queuesByName: Map<QueueName, BuildableQueue>;

    public get hasQueues(): boolean {
        return this.queuesByName.size > 0;
    }

    public get hasOperations(): boolean {
        return this.operationsByName.size > 0;
    }

    public get queues(): Iterable<Queue> {
        return this.queuesByName.values();
    }

    public getQueue(name: QueueName): Queue | undefined {
        return this.queuesByName.get(name);
    }

    protected addQueue(queue: BuildableQueue) {
        if (!this.getQueue(queue.name)) {
            this.queuesByName.set(queue.name, queue);
        }
    }

    protected createOperand(
        name: string,
        type: GraphVertexType,
        pipesByCore?: Map<string, string[]>,
        pipesPerOperator?: { operator: string; pipes: string[]; index: number },
        from?: GraphVertex,
        to?: GraphVertex,
    ): Operand {
        let operand: GraphVertex | undefined;

        if (type === GraphVertexType.QUEUE) {
            if (!this.queuesByName.has(name)) {
                this.queuesByName.set(name, new BuildableQueue(name));
            }
            operand = this.queuesByName.get(name) as BuildableQueue;
        }
        if (type === GraphVertexType.OPERATION) {
            if (!this.operationsByName.has(name)) {
                this.operationsByName.set(name, new BuildableOperation(name, [], [], []));
            }
            operand = this.operationsByName.get(name) as BuildableOperation;
        }
        if (pipesPerOperator) {
            operand?.setPipesForOperator(
                pipesPerOperator.operator,
                pipesPerOperator.pipes || [],
                pipesPerOperator.index,
            );
        }
        if (operand === undefined) {
            throw new Error(`Operand ${name} is neither a queue nor an operation`);
        }
        if (pipesByCore && pipesByCore.size > 0) {
            if (operand.pipeIdsByCore.size > 0) {
                pipesByCore.forEach((newPipeIds, coreId) => {
                    if (operand!.pipeIdsByCore.has(coreId)) {
                        const existingPipesIds = operand!.pipeIdsByCore.get(coreId) || [];
                        pipesByCore.set(coreId, [...existingPipesIds, ...newPipeIds]);
                    }
                });
                operand.pipeIdsByCore.forEach((pipeIds, coreId) => {
                    pipesByCore.set(coreId, pipeIds);
                });
            }
            operand.pipeIdsByCore = pipesByCore;
        }
        return operand;
    }

    private pipesById: Map<string, Pipe> = new Map();

    public get hasPipes(): boolean {
        return this.pipesById.size > 0;
    }

    get pipes(): Map<string, Pipe> {
        return this.pipesById;
    }

    public details = {
        maxBwLimitedFactor: 0,
    };

    private dataIntergrityErrors: DataIntegrityError[] = [];

    constructor(chipId: number) {
        this.chipId = chipId;
        this.operationsByName = new Map();
        this.queuesByName = new Map();
        Chip.GET_NOC_ORDER();
    }

    public static CREATE_FROM_NETLIST_JSON(data: NetlistAnalyzerDataJSON) {
        const chip = new Chip(data.chip_id || 0);
        chip.slowestOpCycles = data.slowest_op_cycles;
        chip.bwLimitedOpCycles = data.bw_limited_op_cycles;

        if (data.arch) {
            if (data.arch.includes(Architecture.GRAYSKULL)) {
                chip.architecture = Architecture.GRAYSKULL;
            }
            if (data.arch.includes(Architecture.WORMHOLE)) {
                chip.architecture = Architecture.WORMHOLE;
            }
        }

        chip.totalOpCycles = Math.min(chip.slowestOpCycles, chip.bwLimitedOpCycles);

        if (chip.totalOpCycles === 0) {
            chip.addDataIntegrityError({
                type: DataIntegrityErrorType.TOTAL_OP_CYCLES_IS_ZERO,
                message: 'Total OP Cycles is zero',
            });
        }

        if (data.dram_channels) {
            chip.dramChannels = data.dram_channels.map((dramChannel) => {
                return new DramChannel(dramChannel.channel_id, dramChannel);
            });
        }

        chip.nodes = data.nodes
            .map((nodeJSON) => {
                const loc: Loc = { x: nodeJSON.location[1], y: nodeJSON.location[0] };
                chip.totalCols = Math.max(loc.y, chip.totalCols);
                chip.totalRows = Math.max(loc.x, chip.totalRows);
                const [node, newOperation] = ComputeNode.fromNetlistJSON(nodeJSON, chip.chipId, (name: OperationName) =>
                    chip.operationsByName.get(name),
                );
                if (newOperation) {
                    // console.log('Adding operation: ', newOperation.name);
                    chip.addOperation(newOperation);
                }
                if (node.dramChannelId !== -1 && chip.dramChannels) {
                    const dramChannel = chip.dramChannels.find((channel) => channel.id === node.dramChannelId) || null;
                    if (dramChannel === null) {
                        console.error(`Node ${node.uid} has a missing dram channel ${node.dramChannelId}`);
                    }
                    const dramSubchannel =
                        dramChannel?.subchannels.find(
                            (subchannel) => subchannel.subchannelId === node.dramSubchannelId,
                        ) || null;
                    if (dramSubchannel === null) {
                        console.error(`Node ${node.uid} has a missing dram subchannel id ${node.dramSubchannelId}`);
                    }
                    node.dramChannel = dramChannel;
                    node.dramSubchannel = dramSubchannel;
                }

                node.links.forEach((link) => {
                    link.pipes.forEach((pipeSegment) => {
                        let pipe: Pipe;
                        if (!chip.pipesById.has(pipeSegment.id)) {
                            pipe = new Pipe(pipeSegment.id);
                            chip.pipesById.set(pipe.id, pipe);
                        } else {
                            pipe = chip.pipesById.get(pipeSegment.id) as Pipe;
                        }
                        if (!pipe.nodes.includes(node)) {
                            pipe.nodes.push(node);
                        }
                        pipe.segments.push(pipeSegment);

                        if (!node.pipes.includes(pipe)) {
                            node.pipes.push(pipe);
                        }
                    });
                });

                node.internalLinks.forEach((link) => {
                    link.pipes.forEach((pipeSegment) => {
                        let pipe: Pipe;
                        if (!chip.pipesById.has(pipeSegment.id)) {
                            pipe = new Pipe(pipeSegment.id);
                            chip.pipesById.set(pipe.id, pipe);
                        } else {
                            pipe = chip.pipesById.get(pipeSegment.id) as Pipe;
                        }
                        if (!pipe.nodes.includes(node)) {
                            pipe.nodes.push(node);
                        }
                        pipe.segments.push(pipeSegment);

                        if (!node.pipes.includes(pipe)) {
                            node.pipes.push(pipe);
                        }
                    });
                });

                return node;
            })
            .sort((a, b) => {
                if (a.loc.y !== b.loc.y) {
                    return a.loc.y - b.loc.y;
                }
                return a.loc.x - b.loc.x;
            });

        return chip;
    }

    public static AUGMENT_FROM_OPS_JSON(chip: Chip, operationsJson: Record<string, OperationDataJSON>): Chip {
        if (chip) {
            const augmentedChip = new Chip(chip.chipId);
            Object.assign(augmentedChip, chip);
            const regex = /^(\d+)-(\d+)-(\d+)$/;

            const pipesAsMap = (coresToPipes: Record<string, string[]>) => {
                return new Map(
                    Object.entries(coresToPipes).map(([coreID, pipes]) => [
                        // TODO: we will need to address this to keep all core IDs consistent
                        coreID.replace(regex, '$1-$3-$2'),
                        pipes.map((pipeId) => pipeId.toString()),
                    ]),
                );
            };

            // const operandsByName: Map<string, Operand> = new Map();

            Object.entries(operationsJson).map(([operationName, opJson]) => {
                const operation = augmentedChip.operationsByName.get(operationName);
                if (!operation) {
                    /** this is perfectly normal, optopipe is a singlefile per temporal epoch and is multichip
                     * we will want to capture ALL information for multichip routing */
                    // console.warn(
                    //     `Operation ${operationName} was found in the op-to-pipe map, but is not present in existing chip data; no core mapping available.`,
                    // );
                    // operation = new BuildableOperation(operationName, [], [], []);
                    // augmentedChip.addOperation(operation);
                    // TODO: we should add ALL operations but only add the operations that run on this chip to the augmentedChip. likely requires a separate structure (graph?)
                    //
                    return null;
                }

                const inputs = opJson.inputs.map((operandJson, index) => {
                    const operatorPipes: string[] = Object.values(operandJson.pipes)
                        .map((pipes) => pipes.map((pipe) => pipe.toString()))
                        .flat();
                    return augmentedChip.createOperand(
                        operandJson.name,
                        operandJson.type as GraphVertexType,
                        pipesAsMap(operandJson.pipes),
                        { operator: operation.name, pipes: operatorPipes, index },
                    );
                });
                const outputs = opJson.outputs.map((operandJson, index) => {
                    const operatorPipes: string[] = Object.values(operandJson.pipes)
                        .map((pipes) => pipes.map((pipe) => pipe.toString()))
                        .flat();
                    return augmentedChip.createOperand(
                        operandJson.name,
                        operandJson.type as GraphVertexType,
                        pipesAsMap(operandJson.pipes),
                        { operator: operation.name, pipes: operatorPipes, index },
                    );
                });

                // Extract queues from input operands
                inputs.forEach((operand) => {
                    if (operand.vertexType === GraphVertexType.QUEUE) {
                        let queue = augmentedChip.queuesByName.get(operand.name);
                        if (!queue) {
                            queue = new BuildableQueue(operand.name);
                            augmentedChip.addQueue(queue);
                        }
                        queue.assignOutputs([augmentedChip.createOperand(operationName, GraphVertexType.OPERATION)]);
                    }
                });
                // Extract queues from output operands
                outputs.forEach((operand) => {
                    if (operand.vertexType === GraphVertexType.QUEUE) {
                        let queue = augmentedChip.queuesByName.get(operand.name);
                        if (!queue) {
                            queue = new BuildableQueue(operand.name);
                            augmentedChip.addQueue(queue);
                        }
                        queue.assignInputs([augmentedChip.createOperand(operationName, GraphVertexType.OPERATION)]);
                    }
                });

                operation.assignInputs(inputs);
                operation.assignOutputs(outputs);

                outputs.forEach((operand: Operand) => {
                    operand.pipeIdsByCore.forEach((pipeIds, nodeId) => {
                        pipeIds.forEach((pipeId) => {
                            const pipe = augmentedChip.pipes.get(pipeId);
                            if (pipe) {
                                pipe.producerCoreOutputOperand = operand;

                                if (!pipe.producerCores.includes(nodeId)) {
                                    pipe.producerCores.push(nodeId);
                                    const node = augmentedChip.getNode(nodeId);
                                    if (node) {
                                        if (!node.producerPipes.includes(pipe)) {
                                            node.producerPipes.push(pipe);
                                        }
                                    }
                                }
                            }
                        });
                    });
                });

                inputs.forEach((operand: Operand) => {
                    operand.pipeIdsByCore.forEach((pipeIds, nodeId) => {
                        pipeIds.forEach((pipeId) => {
                            const pipe = augmentedChip.pipes.get(pipeId);
                            if (pipe) {
                                pipe.consumerCoreInputOperand = operand;
                                if (!pipe.consumerCores.includes(nodeId)) {
                                    pipe.consumerCores.push(nodeId);
                                    const node = augmentedChip.getNode(nodeId);
                                    if (node) {
                                        if (!node.consumerPipes.includes(pipe)) {
                                            node.consumerPipes.push(pipe);
                                        }
                                    }
                                }
                            }
                        });
                    });
                });
                return operation;
            });

            return augmentedChip;
        }
        throw new Error('Chip is null');
    }

    public static CREATE_FROM_CHIP_DESIGN(json: ChipDesignJSON) {
        const chipDesign = new ChipDesign(json);
        const chip = new Chip(0);
        chip.nodes = chipDesign.nodes.map((simpleNode) => {
            const node = new ComputeNode(`${chip.chipId}-${simpleNode.loc.x}-${simpleNode.loc.y}`);
            node.type = simpleNode.type;
            node.loc = simpleNode.loc;
            node.dramChannelId = simpleNode.dramChannelId;
            node.dramSubchannelId = simpleNode.dramSubchannelId;
            return node;
        });
        chip.totalRows = chipDesign.totalRows;
        chip.totalCols = chipDesign.totalCols;
        chip.architecture = chipDesign.architecture;
        return chip;
    }

    static AUGMENT_FROM_GRAPH_DESCRIPTOR(chip: Chip, graphDescriptorJson: GraphDescriptorJSON) {
        const newChip = new Chip(chip.chipId);
        Object.assign(newChip, chip);

        const opMap: Map<OperationName, OperationDescription> = aggregateCoresByOperation(graphDescriptorJson);

        const operations = mapIterable(opMap.entries(), ([opName, opDescriptor]) => {
            if (opName === undefined) {
                console.error('Likely an empty graph');
                throw new Error('opName is undefined');
            }
            const cores: ComputeNode[] = opDescriptor.cores
                // `core.id` is only an x-y locations and doesn't include Chip ID
                .map((core) => newChip.getNode(`${chip.chipId}-${core.id}`));
            const inputs = opDescriptor.inputs.map((operandJson) =>
                newChip.createOperand(operandJson.name, operandJson.type),
            );
            const outputs = opDescriptor.outputs.map((operandJson: OperandJSON) =>
                newChip.createOperand(operandJson.name, operandJson.type),
            );

            // Extract queues from input operands
            inputs.forEach((operand) => {
                if (operand.vertexType === GraphVertexType.QUEUE) {
                    let queue = newChip.queuesByName.get(operand.name);
                    if (!queue) {
                        queue = new BuildableQueue(operand.name);
                        chip.addQueue(queue);
                    }
                    queue.assignOutputs([newChip.createOperand(opName, GraphVertexType.OPERATION)]);
                }
            });
            // Extract queues from output operands
            outputs.forEach((operand) => {
                if (operand.vertexType === GraphVertexType.QUEUE) {
                    let queue = newChip.queuesByName.get(operand.name);
                    if (!queue) {
                        queue = new BuildableQueue(operand.name);
                        chip.addQueue(queue);
                    }
                    queue.assignInputs([newChip.createOperand(opName, GraphVertexType.OPERATION)]);
                }
            });

            if (newChip.operationsByName.has(opName)) {
                return newChip.operationsByName.get(opName) as BuildableOperation;
            }
            return new BuildableOperation(opName, cores, inputs, outputs);
        });

        /** if we have netlist and optopipe we should actively avoid this */
        // TODO: possible use if netlist isnt available
        // forEach(operations, (operation) => newChip.updateOperation(operation));
        return newChip;
    }

    static AUGMENT_WITH_QUEUE_DETAILS(chip: Chip, queueDescriptorJson: QueueDescriptorJson) {
        forEach(chip.queuesByName.values(), (queue) => {
            const details = queueDescriptorJson[queue.name];
            details.processedLocation = parsedQueueLocation(details.location);
            queue.details = { ...details };
            details['allocation-info'].forEach((allocationInfo) => {
                if (details.processedLocation === QueueLocation.DRAM) {
                    chip.getNodeByChannelId(allocationInfo.channel).forEach((node: ComputeNode) => {
                        if (!node.queueList.includes(queue)) {
                            node.queueList.push(queue);
                        }
                    });
                }
            });
        });

        const newChip = new Chip(chip.chipId);
        Object.assign(newChip, chip);

        return newChip;
    }

    static AUGMENT_WITH_PERF_ANALYZER_RESULTS(chip: Chip, perfAnalyzerJson: PerfAnalyzerResultsJson) {
        const newChip = new Chip(chip.chipId);
        Object.assign(newChip, chip);

        forEach(Object.keys(perfAnalyzerJson), (nodeUid: string) => {
            const node = chip.getNode(nodeUid);
            if (node.type === ComputeNodeType.CORE) {
                node.perfAnalyzerResults = new MeasurementDetails(perfAnalyzerJson[node.uid]);
                newChip.details.maxBwLimitedFactor = Math.max(
                    newChip.details.maxBwLimitedFactor,
                    node.perfAnalyzerResults.bw_limited_factor,
                );
            } else {
                console.error('Attempted to add perf details to a node that is not a core:', nodeUid, node);
            }
        });

        return newChip;
    }

    static AUGMENT_WITH_OP_PERFORMANCE(chip: Chip, perfAnalyzerResultsOps: OpPerformanceByOp) {
        const newChip = new Chip(chip.chipId);
        Object.assign(newChip, chip);

        forEach(perfAnalyzerResultsOps.entries(), ([opName, opDetails]) => {
            const operation = newChip.getOperation(opName);
            if (operation) {
                operation.details = new OpPerfDetails(opDetails);
                newChip.details.maxBwLimitedFactor = Math.max(
                    newChip.details.maxBwLimitedFactor,
                    opDetails.bw_limited_factor,
                );
            }
        });

        return newChip;
    }

    public generateInitialPipesSelectionState(): PipeSelection[] {
        return this.allUniquePipes.map((pipeSegment) => {
            return { id: pipeSegment.id, selected: false } as PipeSelection;
        });
    }

    getNodesForPipe(pipeId: string): ComputeNode[] {
        const nodes = filterIterable(this.nodes, (node) => {
            let hasPipe = false;
            node.links.forEach((link) => {
                if (link.pipes.some((pipe) => pipe.id === pipeId)) {
                    hasPipe = true;
                }
            });
            return hasPipe;
        });
        return [...nodes];
    }

    getAllLinks(): NetworkLink[] {
        const links: NetworkLink[] = [];
        forEach(this.nodes, (node) => {
            node.links.forEach((link) => {
                links.push(link);
            });
            node.internalLinks.forEach((link) => {
                links.push(link);
            });
        });
        this.dramChannels.forEach((dramChannel) => {
            dramChannel.links.forEach((link) => {
                links.push(link);
                dramChannel.subchannels.forEach((subchannel) => {
                    subchannel.links.forEach((subchannelLink) => {
                        links.push(subchannelLink);
                    });
                });
            });
        });
        return links;
    }

    get ethernetPipes(): PipeSegment[] {
        return [...this.nodes]
            .filter((node) => node.type === ComputeNodeType.ETHERNET)
            .map((node) => {
                return (
                    node
                        .getInternalLinksForNode()
                        .filter(
                            (link) => link.name === EthernetLinkName.ETH_IN || link.name === EthernetLinkName.ETH_OUT,
                        )
                        .map((link) => link.pipes)
                        .flat() || []
                );
            })
            .flat();
    }

    get allUniquePipes(): PipeSegment[] {
        if (!this.uniquePipeSegmentList.length) {
            this.uniquePipeSegmentList = [...this.pipes.values()]
                .map((pipe) => pipe.segments[0])
                .sort((a, b) => {
                    if (a.id < b.id) {
                        return -1;
                    }
                    if (a.id > b.id) {
                        return 1;
                    }
                    return 0;
                });
        }
        return this.uniquePipeSegmentList;
    }

    addDataIntegrityError(error: DataIntegrityError) {
        this.dataIntergrityErrors.push(error);
    }

    hasDataIntegrityError(type: DataIntegrityErrorType): boolean {
        return this.dataIntergrityErrors.some((e) => e.type === type);
    }
}

export class DramChannel {
    public id: number;

    public subchannels: DramSubchannel[] = [];

    public links: DramBankLink[] = [];

    constructor(id: number, json: DramChannelJSON) {
        this.id = id;
        if (json.subchannels) {
            this.subchannels = json.subchannels.map((subchannel, i) => {
                return new DramSubchannel(i, id, subchannel);
            });
            if (json.dram_inout) {
                this.links.push(
                    new DramBankLink(
                        DramBankLinkName.DRAM_INOUT,
                        `${id}-${DramBankLinkName.DRAM_INOUT}`,
                        json.dram_inout,
                    ),
                );
            }
            if (json.dram0_inout) {
                this.links.push(
                    new DramBankLink(
                        DramBankLinkName.DRAM0_INOUT,
                        `${id}-${DramBankLinkName.DRAM0_INOUT}`,
                        json.dram0_inout,
                    ),
                );
            }
            if (json.dram1_inout) {
                this.links.push(
                    new DramBankLink(
                        DramBankLinkName.DRAM1_INOUT,
                        `${id}-${DramBankLinkName.DRAM1_INOUT}`,
                        json.dram1_inout,
                    ),
                );
            }
        }
    }
}

export class DramSubchannel {
    public readonly subchannelId: number;

    public readonly channelId: number;

    public links: NOC2AXILink[] = [];

    constructor(
        subchannelId: number,
        channelId: number,
        json: {
            [key: string]: NOCLinkJSON;
        },
    ) {
        this.subchannelId = subchannelId;
        this.channelId = channelId;
        Object.entries(json).forEach(([key, value]) => {
            this.links.push(
                NetworkLink.CREATE(key as NOC2AXILinkName, `${channelId}-${subchannelId}-${key}`, value) as NOC2AXILink,
            );
        });
    }
}

export abstract class NetworkLink {
    abstract type: LinkType;

    readonly uid: string;

    public readonly name: NetworkLinkName;

    readonly numOccupants: number = 0;

    readonly totalDataBytes: number = 0;

    readonly maxBandwidth: number = 0;

    public pipes: PipeSegment[] = [];

    public static CREATE(name: NetworkLinkName, uid: string, json: NOCLinkJSON): NetworkLink {
        if (Object.values(NOCLinkName).includes(name as NOCLinkName)) {
            return new NOCLink(name as NOCLinkName, uid, json);
        }
        if (Object.values(NOC2AXILinkName).includes(name as NOC2AXILinkName)) {
            return new NOC2AXILink(name as NOC2AXILinkName, uid, json);
        }
        if (Object.values(DramBankLinkName).includes(name as DramBankLinkName)) {
            return new DramBankLink(name as DramBankLinkName, uid, json);
        }
        if (Object.values(EthernetLinkName).includes(name as EthernetLinkName)) {
            return new EthernetLink(name as EthernetLinkName, uid, json);
        }
        if (Object.values(PCIeLinkName).includes(name as PCIeLinkName)) {
            return new PCIeLink(name as PCIeLinkName, uid, json);
        }

        throw new Error(`Invalid network link name ${name}`);
    }

    // readonly noc: NOC;

    constructor(name: NetworkLinkName, uid: string, json: NOCLinkJSON) {
        this.uid = uid;
        this.numOccupants = json.num_occupants;
        this.totalDataBytes = json.total_data_in_bytes;
        this.maxBandwidth = json.max_link_bw;
        this.name = name;

        this.pipes = Object.entries(json.mapped_pipes).map(
            ([pipeId, bandwidth]) => new PipeSegment(pipeId, bandwidth, name, this.totalDataBytes),
        );
    }

    public generateInitialState(): LinkState {
        return {
            id: this.uid,
            totalDataBytes: this.totalDataBytes,
            bpc: 0,
            saturation: 0,
            maxBandwidth: this.maxBandwidth,
            type: this.type,
        } as LinkState;
    }
}

export class NOCLink extends NetworkLink {
    // public name: NOCLinkName;

    public readonly type: LinkType = LinkType.NOC;

    public readonly noc: NOC;

    constructor(name: NOCLinkName | NOC2AXILinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
        this.noc = name.includes('noc0') ? NOC.NOC0 : NOC.NOC1;
        // this.name = name;
    }
}

export class NOC2AXILink extends NOCLink {
    constructor(name: NOC2AXILinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
    }
}

export class EthernetLink extends NetworkLink {
    public readonly type: LinkType = LinkType.ETHERNET;

    constructor(name: EthernetLinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
    }
}

export class PCIeLink extends NetworkLink {
    public readonly type: LinkType = LinkType.PCIE;

    constructor(name: PCIeLinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
    }
}

export class DramBankLink extends NetworkLink {
    public readonly bank: DRAMBank = DRAMBank.NONE;

    public readonly type: LinkType = LinkType.DRAM;

    constructor(name: DramBankLinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);

        if (name.includes('dram0')) {
            this.bank = DRAMBank.BANK0;
        } else {
            this.bank = DRAMBank.BANK1;
        }
    }
}

export class ComputeNode {
    /** Creates a ComputeNode from a Node JSON object in a Netlist Analyzer output file.
     *
     * The constructed object will include a reference to an Operation, if an operation is
     * specified in the JSON file.
     *   - A new operation will be created if `getOperation` does not return a match for the operation name
     *   - The referenced operation will gain a back-reference to the new core
     *   - If a new operation is created, it will be returned as the second value of the returned tuple
     */
    static fromNetlistJSON(
        nodeJSON: NodeDataJSON,
        chipId: number,
        getOperation: (name: OperationName) => BuildableOperation | undefined,
    ): [node: ComputeNode, createdOperation?: BuildableOperation] {
        const node = new ComputeNode(`${chipId}-${nodeJSON.location[0]}-${nodeJSON.location[1]}`);
        node.opCycles = nodeJSON.op_cycles;
        node.links = new Map();
        node.chipId = chipId;
        node.harvested = nodeJSON.harvested ?? false;

        node.type = nodeJSON.type as ComputeNodeType;
        if (nodeJSON.dram_channel !== undefined && nodeJSON.dram_channel !== null) {
            node.dramChannelId = nodeJSON.dram_channel;
            node.dramSubchannelId = nodeJSON.dram_subchannel || 0;
        }
        node.loc = { x: nodeJSON.location[0], y: nodeJSON.location[1] };
        node.uid = `${node.chipId}-${node.loc.x}-${node.loc.y}`;

        if (nodeJSON.dram_channel !== undefined && nodeJSON.dram_channel !== null) {
            node.dramChannelId = nodeJSON.dram_channel;
            node.dramSubchannelId = nodeJSON.dram_subchannel || 0;
        }

        const linkId = `${node.loc.x}-${node.loc.y}`;

        Object.entries(nodeJSON.links).forEach(([linkName, linkJson], index) => {
            const link: NetworkLink = NetworkLink.CREATE(linkName as NOCLinkName, `${linkId}-${index}`, linkJson);
            if (link.type === LinkType.NOC) {
                node.links.set(linkName, link as NOCLink);
            }
            if (link.type === LinkType.ETHERNET) {
                node.internalLinks.set(linkName, link as EthernetLink);
            }
            if (link.type === LinkType.PCIE) {
                node.internalLinks.set(linkName, link as PCIeLink);
            }
        });

        // Associate with operation
        const opName: OperationName = nodeJSON.op_name;
        if (opName) {
            let operation = getOperation(opName);
            if (operation) {
                operation.assignCore(node);
                node.operation = operation;
            } else {
                operation = new BuildableOperation(opName, [node]);
                node.operation = operation;
                return [node, operation];
            }
        }
        return [node];
    }

    /**
     * Chip ID in a multichip data scenario. NOT node id.
     */
    public chipId: number = 0;

    /**
     * Unique ID for the node.
     */
    public uid: string;

    public type: ComputeNodeType = ComputeNodeType.NONE;

    public harvested: boolean = false;

    public loc: Loc = { x: 0, y: 0 };

    public opCycles: number = 0;

    public links: Map<any, NOCLink> = new Map();

    /** @description Off chip links that are not part of the NOC, excluding DRAM links */
    public internalLinks: Map<any, NetworkLink> = new Map();

    public dramChannel: DramChannel | null = null;

    public dramSubchannel: DramSubchannel | null = null;

    public queueList: Queue[] = [];

    public consumerPipes: Pipe[] = [];

    public producerPipes: Pipe[] = [];

    public pipes: Pipe[] = [];

    /**
     * only relevant for dram nodes
     */
    public dramSubchannelId: number = 0;

    /**
     * only relevant for dram nodes
     */
    public dramChannelId: number = -1;

    // TODO: check if reassigend operation is updated here.
    private _operation: Operation | undefined = undefined;

    public get operation(): Operation | undefined {
        return this._operation;
    }

    public set operation(value: Operation | undefined) {
        if (this._operation !== undefined) {
            return;
        }
        this._operation = value;
    }

    public perfAnalyzerResults?: MeasurementDetails;

    constructor(uid: string, operation?: Operation) {
        this.uid = uid;
        this.operation = operation;
    }

    // TODO: this doesnt look like it shoudl still be here, keeping to retain code changes

    /** @Deprecated
     * Superceded by `this.operation.name`
     */
    get opName(): string {
        return this.operation?.name || '';
    }

    public generateInitialState(): ComputeNodeState {
        return {
            id: this.uid,
            selected: false,
            loc: this.loc,
            queueNameList: this.queueList.map((queue) => queue.name),
            opName: this.opName,
            dramChannelId: this.dramChannelId,
            dramSubchannelId: this.dramSubchannelId,
        } as ComputeNodeState;
    }

    /**
     * @description Returns the links for node in the order defined by the NOC.
     */
    public getNOCLinksForNode = (): NOCLink[] => {
        return [...this.links.values()].sort((a, b) => {
            const firstKeyOrder = Chip.GET_NOC_ORDER().get(a.name as NOCLinkName) ?? Infinity;
            const secondKeyOrder = Chip.GET_NOC_ORDER().get(b.name as NOCLinkName) ?? Infinity;
            return firstKeyOrder - secondKeyOrder;
        });
    };

    /**
     * @description Returns all internal links with noc links.
     */
    public getInternalLinksForNode = (): NetworkLink[] => {
        const links: NetworkLink[] = [...this.links.values()]
            .filter((link) => {
                return INTERNAL_LINK_NAMES.includes(link.name);
            })
            .sort((a, b) => {
                const firstKeyOrder = Chip.GET_NOC_ORDER().get(a.name as NOCLinkName) ?? Infinity;
                const secondKeyOrder = Chip.GET_NOC_ORDER().get(b.name as NOCLinkName) ?? Infinity;
                return firstKeyOrder - secondKeyOrder;
            });
        links.push(...this.internalLinks.values());
        return links;
    };

    public getPipeIdsForNode = (): string[] => {
        const pipeIds: string[] = [];

        this.links.forEach((link) => {
            pipeIds.push(...link.pipes.map((pipe) => pipe.id));
        });

        this.internalLinks.forEach((link) => {
            pipeIds.push(...link.pipes.map((pipe) => pipe.id));
        });

        return pipeIds;
    };

    getInternalPipeIDsForNode = (): string[] => {
        return [...this.links.values()]
            .filter((link) => {
                return INTERNAL_NOC_LINK_NAMES.includes(link.name as NOCLinkName);
            })
            .map((link) => {
                return [...link.pipes.map((pipe) => pipe.id)];
            })
            .concat(
                ...[...this.internalLinks.values()].map((link) => {
                    return [...link.pipes.map((pipe) => pipe.id)];
                }),
            )
            .flat();
    };

    public getPipesForDirection(direction: NOCLinkName): string[] {
        return this.links.get(direction)?.pipes.map((pipe) => pipe.id) || [];
    }

    public getNodeLabel(): string {
        if (this.type === ComputeNodeType.CORE) {
            return 'c';
        }
        if (this.type === ComputeNodeType.ROUTER) {
            return 'r';
        }
        if (this.type === ComputeNodeType.DRAM) {
            return 'd';
        }
        if (this.type === ComputeNodeType.ETHERNET) {
            return 'e';
        }
        if (this.type === ComputeNodeType.PCIE) {
            return 'p';
        }
        return '';
    }
}

export class Pipe {
    readonly id: string;

    nodes: ComputeNode[] = [];

    producerCoreOutputOperand: Operand | null = null;

    consumerCoreInputOperand: Operand | null = null;

    producerCores: string[] = [];

    consumerCores: string[] = [];

    segments: PipeSegment[] = [];

    get nodeIdList(): string[] {
        return this.nodes.map((node) => node.uid);
    }

    get locations(): Loc[] {
        return this.nodes.map((node) => node.loc);
    }

    constructor(id: string) {
        this.id = id;
    }
}

export class PipeSegment {
    readonly id: string;

    /** @description unused?
     @Deprecated */
    location: Loc = { x: 0, y: 0 };

    readonly bandwidth: number;

    readonly linkName: NetworkLinkName;

    readonly bandwidthUse: number;

    constructor(id: string, bandwidth: number, linkName: NetworkLinkName, linkTotalData: number = 0) {
        this.id = id;
        this.linkName = linkName as NetworkLinkName;
        this.bandwidth = bandwidth || 0;
        this.bandwidthUse = (this.bandwidth / linkTotalData) * 100 || 0;
    }
}

export const convertBytes = (bytes: number, numAfterComma = 0) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
        return '0 B';
    }
    if (bytes < 1) {
        return `${bytes.toFixed(numAfterComma)} B`;
    }

    const denominationIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const fractionDigits = denominationIndex > 1 ? 2 : numAfterComma; // MB and up always requires decimals
    return `${(bytes / 1024 ** denominationIndex).toFixed(fractionDigits)} ${sizes[denominationIndex]}`;
};

export const formatToBytesPerCycle = (bytes: number, numAfterComma = 0) => {
    return `${convertBytes(bytes, numAfterComma)}/cycle`;
};

export const recalculateLinkSaturation = (link: LinkState, totalOpCycles: number) => {
    link.bpc = link.totalDataBytes / totalOpCycles;
    link.saturation = (link.bpc / link.maxBandwidth) * 100;
};
