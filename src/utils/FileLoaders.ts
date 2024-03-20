/* eslint-disable no-console */

import GraphOnChip from 'data/GraphOnChip';
import {
    ChipDesignJSON,
    GraphnameToEpochToDeviceJSON,
    MetadataJSON,
    NetlistAnalyzerDataJSON,
} from 'data/JSONDataTypes';
import { Architecture } from 'data/Types';
import { GraphDescriptorJSON } from 'data/sources/GraphDescriptor';
import {
    OpPerfJSON,
    OpPerformanceByOp,
    PerfAnalyzerResultsJson,
    PerfAnalyzerResultsPerOpJSON,
} from 'data/sources/PerfAnalyzerResults';
import { QueueDescriptorJson } from 'data/sources/QueueDescriptor';
// TODO: Replace FS to use the native promise one
// Node 20 supports FS using promises instead of callbacks
// update this to use the new pattern
// ref: https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#fspromisesopendirpath-options
import fs, { Dirent, existsSync } from 'fs';
import { load } from 'js-yaml';
import path from 'path';
import Cluster from '../data/Cluster';
import { GraphRelationshipState } from '../data/StateTypes';
import { ClusterDescriptorJSON, DeviceDescriptorJSON } from '../data/sources/ClusterDescriptor';

export const readFile = async (filename: string): Promise<string> =>
    new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

export const loadJsonFile = async (filePath: string): Promise<unknown> => {
    const file = await readFile(filePath);
    return JSON.parse(file);
};

export const readDirEntries = async (dirPath: string): Promise<Dirent[]> => {
    return new Promise<Dirent[]>((resolve, reject) => {
        fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
};

export const findFiles = async (
    searchPath: string,
    searchQuery: string,
    options?: {
        isDir?: boolean;
        maxDepth?: number;
    },
): Promise<string[]> => {
    const { isDir = false, maxDepth = 0 } = options || {};
    if (maxDepth < 0) {
        throw new Error('maxDepth must be non-negative');
    }

    const allEntries = await readDirEntries(searchPath);
    const matches = allEntries.filter(
        (file) => ((isDir && file.isDirectory()) || (!isDir && file.isFile())) && file.name === searchQuery,
    );
    if (matches.length > 0) {
        return matches.map((dirEntry) => path.join(searchPath, dirEntry.name));
    }
    if (maxDepth === 0) {
        return [];
    }
    const subdirectories = allEntries.filter((dirEntry) => dirEntry.isDirectory());
    const subfolderResults = await Promise.all(
        subdirectories.map(async (dirEntry) =>
            findFiles(path.join(searchPath, dirEntry.name), searchQuery, {
                isDir,
                maxDepth: maxDepth - 1,
            }),
        ),
    );
    return subfolderResults.flat();
};

/** @description
 * this used to check for all of the important folders. we no longer care
 * the app can work as long as there is at least something usable there.
 */
export const validatePerfResultsFolder = async (dirPath: string): Promise<[isValid: boolean, error: string | null]> => {
    if (!fs.existsSync(dirPath)) {
        return [false, 'Folder does not exist'];
    }
    return [true, null];
};
const getAvailableGraphNamesFromNetlistAnalyzer = async (folderPath: string): Promise<GraphRelationshipState[]> => {
    try {
        const netlistAnalyzerFiles = await readDirEntries(path.join(folderPath, 'netlist_analyzer'));
        return netlistAnalyzerFiles
            .filter((file) => file.isFile() && file.name.includes('temporal_epoch'))
            .map((file) => file.name)
            .map((filename) => {
                const epoch = getTemporalEpochFromGraphName(filename);
                const chipId = getChipIdFromFilename(filename);
                return {
                    name: filename,
                    temporalEpoch: epoch,
                    chipId,
                } as GraphRelationshipState;
            });
    } catch (err) {
        console.error('Failed to read netlist_analyzer folder', err);
        return [];
    }
};

export const getAvailableGraphNames = async (perfResultsPath: string): Promise<GraphRelationshipState[]> => {
    try {
        const runtimeDataPath = path.join(perfResultsPath, 'runtime_data.yaml');
        const runtimeDataYaml = await readFile(runtimeDataPath);
        const runtimeData = load(runtimeDataYaml) as any;

        return Object.entries(runtimeData.graph_to_epoch_map as GraphnameToEpochToDeviceJSON).map(
            ([graphName, mapping]) => {
                return {
                    name: graphName,
                    temporalEpoch: mapping.epoch_id,
                    chipId: mapping.target_device,
                } as GraphRelationshipState;
            },
        );
    } catch (err) {
        console.error('Failed to read runtime_data.yaml', err);
    }

    return getAvailableGraphNamesFromNetlistAnalyzer(perfResultsPath);
};

export const loadCluster = async (perfResultsPath: string): Promise<Cluster | null> => {
    try {
        const clusterDescFilePath = path.join(perfResultsPath, 'cluster_desc.yaml');
        const clusterDescYaml = await readFile(clusterDescFilePath);
        const clusterDescriptor = load(clusterDescYaml) as ClusterDescriptorJSON;

        const deviceDescFolder = path.join(perfResultsPath, 'device_desc_runtime');
        const deviceDescFiles = await readDirEntries(deviceDescFolder);
        const deviceDescriptorResults = deviceDescFiles.map(async (file) => {
            const descriptorPath = path.join(deviceDescFolder, file.name);
            const descriptorYaml = await readFile(descriptorPath);
            return load(descriptorYaml) as DeviceDescriptorJSON;
        });
        const deviceDescriptorList = await Promise.all(deviceDescriptorResults);

        return new Cluster(clusterDescriptor, deviceDescriptorList);
    } catch (err) {
        console.error('Failed to load cluster description', err);
    }
    return null;
};

const loadChipFromArchitecture = async (architecture: Architecture): Promise<GraphOnChip> => {
    if (architecture === Architecture.NONE) {
        throw new Error('No architecture provided.');
    }
    const grayskullArch = await import('data/architectures/arch-grayskull.json');
    const wormholeArch = await import('data/architectures/arch-wormhole.json');

    const architectureJson = {
        [Architecture.GRAYSKULL]: grayskullArch.default,
        [Architecture.WORMHOLE]: wormholeArch.default,
    }[architecture];

    return GraphOnChip.CREATE_FROM_CHIP_DESIGN(architectureJson as ChipDesignJSON);
};

/** @description only for netlist analizer files */
const getTemporalEpochFromGraphName = (filename: string): number | null => {
    const regex = /temporal_epoch_(\d+)|fwd_(?:\d+_)*(\d+)/;
    const match = filename.match(regex);
    if (match) {
        const numberMatch = match[1] || match[2];
        if (numberMatch) {
            return parseInt(numberMatch, 10);
        }
    }
    return null;
};

/** @description only for netlist analizer files */
const getChipIdFromFilename = (filename: string): number | null => {
    const regex = /chip(?:_|)(\d+)/;
    const match = filename.match(regex);
    return match ? parseInt(match[1], 10) : null;
};

/** @description only for netlist analizer files */
const isFileMatchByIdOrEpoch = (filename: string, id: number | null, epoch: number | null): boolean => {
    if (id === null && epoch === null) {
        return false;
    }
    if (epoch === null) {
        return getChipIdFromFilename(filename) === id;
    }
    if (id === null) {
        return getTemporalEpochFromGraphName(filename) === epoch;
    }

    return getTemporalEpochFromGraphName(filename) === epoch && getChipIdFromFilename(filename) === id;
};

const loadChipFromNetlistAnalyzer = async (
    folderPath: string,
    graphName: string,
    chipId: number | null,
    temporalEpoch: number | null,
): Promise<GraphOnChip | null> => {
    try {
        const netListAnalyzerFiles = await readDirEntries(path.join(folderPath, 'netlist_analyzer'));
        let netlistAnalyzerFilepath: string = '';
        let netlistAnalyzerOptoPipeFilepath: string = '';
        netListAnalyzerFiles.forEach((file) => {
            if (
                file.isFile() &&
                file.name.includes('temporal_epoch') &&
                isFileMatchByIdOrEpoch(file.name, chipId, temporalEpoch)
            ) {
                netlistAnalyzerFilepath = path.join(folderPath, 'netlist_analyzer', file.name);
            }
        });
        const optoPipesReportsFolder = path.join(folderPath, 'reports');
        const optoPipesFiles = await readDirEntries(optoPipesReportsFolder);
        const opToPipeFile = optoPipesFiles.find(
            (file) =>
                file.isFile() &&
                file.name.includes('temporal_epoch') &&
                getTemporalEpochFromGraphName(file.name) === temporalEpoch,
        );
        if (opToPipeFile) {
            netlistAnalyzerOptoPipeFilepath = path.join(optoPipesReportsFolder, opToPipeFile.name);
        }
        if (netlistAnalyzerFilepath !== '') {
            const data = await readFile(netlistAnalyzerFilepath);
            let graphOnChip = GraphOnChip.CREATE_FROM_NETLIST_JSON(load(data) as NetlistAnalyzerDataJSON);
            if (netlistAnalyzerOptoPipeFilepath !== '') {
                try {
                    const opsData = await readFile(netlistAnalyzerOptoPipeFilepath);
                    graphOnChip = GraphOnChip.AUGMENT_FROM_OPS_JSON(graphOnChip, (load(opsData) as any).ops);
                    if (graphOnChip) {
                        return graphOnChip;
                    }
                } catch (err) {
                    console.error('Failed to read opto pipes file', err);
                }
                if (graphOnChip) {
                    return graphOnChip;
                }
            }
        } else {
            console.error('Failed to read netlist analyzer file');
        }
    } catch (err) {
        console.error(err);
    }
    return null;
};
export const loadGraph = async (folderPath: string, graph: GraphRelationshipState): Promise<GraphOnChip> => {
    const { name, chipId, temporalEpoch } = graph;

    let architecture = Architecture.NONE;

    let graphOnChip: GraphOnChip | null = await loadChipFromNetlistAnalyzer(path.join(folderPath), name, chipId, temporalEpoch);

    if (graphOnChip === null) {
        try {
            const metadata = (await loadJsonFile(
                path.join(folderPath, 'perf_results', 'metadata', `${name}.json`),
            )) as MetadataJSON;
            const arch = metadata.arch_name;
            if (arch.includes(Architecture.GRAYSKULL)) {
                architecture = Architecture.GRAYSKULL;
            }
            if (arch.includes(Architecture.WORMHOLE)) {
                architecture = Architecture.WORMHOLE;
            }
        } catch (err) {
            console.error('Failed to read metadata from folder:', err);
        }
        graphOnChip = await loadChipFromArchitecture(architecture);
    }

    try {
        const graphPath = path.join(folderPath, `perf_results`, 'graph_descriptor', name, 'cores_to_ops.json');
        const graphDescriptorJson = await loadJsonFile(graphPath);

        graphOnChip = GraphOnChip.AUGMENT_FROM_GRAPH_DESCRIPTOR(graphOnChip, graphDescriptorJson as GraphDescriptorJSON);
    } catch (err) {
        console.error('graph_descriptor.json not found, skipping \n', err);
    }
    try {
        const queuesPath = path.join(folderPath, `perf_results`, 'queue_descriptor', 'queue_descriptor.json');
        const queueDescriptorJson = await loadJsonFile(queuesPath);

        graphOnChip = GraphOnChip.AUGMENT_WITH_QUEUE_DETAILS(graphOnChip, queueDescriptorJson as QueueDescriptorJson);
    } catch (err) {
        console.error('graph_descriptor.json not found, skipping \n', err);
    }
    try {
        const analyzerResultsPath = path.join(
            folderPath,
            `perf_results`,
            'analyzer_results',
            name,
            'graph_perf_report_per_op.json',
        );
        const analyzerResultsJson = (await loadJsonFile(analyzerResultsPath)) as PerfAnalyzerResultsPerOpJSON;

        const opPerformanceByOp: OpPerformanceByOp = new Map();
        const analyzerResultsJsonWithChipIds: PerfAnalyzerResultsJson = Object.fromEntries(
            Object.entries(analyzerResultsJson)
                .map(([opName, result]) => {
                    opPerformanceByOp.set(opName, {
                        ...result['op-measurements'],
                        ...result['op-attributes'],
                    } as OpPerfJSON);
                    /* TODO: Should use an actual `device-id` for the chipId. The device-id mappings for graphs are available in
                     *   `perf_results/perf_info_all_epochs.csv`.
                     *
                     * The node ID keys in the perf analyzer results file don't have the graphOnChip ID (device ID) component.
                     * We're forcing graphOnChip ID to 0 here, since for now we're only dealing with single-graph temporal epochs.
                     */
                    return Object.entries(result['core-measurements']).map(([coreId, corePerfJson]) => {
                        return [`${graphOnChip?.chipId}-${coreId}`, corePerfJson];
                    });
                })
                .flat(),
        );

        graphOnChip = GraphOnChip.AUGMENT_WITH_PERF_ANALYZER_RESULTS(graphOnChip, analyzerResultsJsonWithChipIds);

        graphOnChip = GraphOnChip.AUGMENT_WITH_OP_PERFORMANCE(graphOnChip, opPerformanceByOp);
    } catch (err) {
        console.error('graph_perf_report_per_op.json not found, skipping \n', err);
    }

    return graphOnChip;
};

export const getAvailableNetlistFiles = async (folderPath: string): Promise<string[]> => {
    const netlistAnalyzerFileMask = /^analyzer_output_.*.yaml$/;
    const allFilesList = await readDirEntries(folderPath);
    return allFilesList.map((file) => file.name).filter((file) => netlistAnalyzerFileMask.test(file));
};

export const checkLocalFolderExists = (localPath?: string) => {
    return (localPath && existsSync(localPath)) || false;
};
