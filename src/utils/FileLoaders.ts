import Chip from 'data/Chip';
import { ChipDesignJSON } from 'data/JSONDataTypes';
import { Architecture } from 'data/Types';
import { GraphDescriptorJSON } from 'data/sources/GraphDescriptor';
import {
    OpPerfJSON,
    OpPerformanceByOp,
    PerfAnalyzerResultsJson,
    PerfAnalyzerResultsPerOpJSON,
} from 'data/sources/PerfAnalyzerResults';
import { QueueDescriptorJson } from 'data/sources/QueueDescriptor';
import fs, { Dirent } from 'fs';
import path from 'path';

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
    options?: { isDir?: boolean; maxDepth?: number },
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

export const validatePerfResultsFolder = async (dirPath: string): Promise<[isValid: boolean, error: string | null]> => {
    if (path.basename(dirPath) !== 'perf_results') {
        return [false, 'Folder name must be "perf_results"'];
    }
    if (!fs.existsSync(dirPath)) {
        return [false, 'Folder does not exist'];
    }

    const analyzerFolderExists =
        (await findFiles(dirPath, 'analyzer_results', { isDir: true, maxDepth: 0 })).length === 1;
    const graphFolderExists = (await findFiles(dirPath, 'graph_descriptor', { isDir: true, maxDepth: 0 })).length === 1;

    if (analyzerFolderExists && graphFolderExists) {
        return [true, null];
    }
    const missingSubfolders: string[] = [];
    if (!analyzerFolderExists) {
        missingSubfolders.push('analyzer_folder');
    }
    if (!graphFolderExists) {
        missingSubfolders.push('graph_descriptor');
    }

    return [false, `Selected folder is missing required subdirectory: ${missingSubfolders.join(', ')}`];
};

export const getAvailableGraphNames = async (perfResultsPath: string): Promise<string[]> => {
    const graphDescriptorsPath = path.join(perfResultsPath, 'graph_descriptor');
    const graphDirEntries = await readDirEntries(graphDescriptorsPath);
    return graphDirEntries.map((graphDirEntry) => graphDirEntry.name).filter((name) => !name.startsWith('.'));
};

const loadChipFromArchitecture = async (architecture: Architecture): Promise<Chip> => {
    if (architecture === Architecture.NONE) {
        throw new Error('No architecture provided.');
    }
    const grayskullArch = await import('data/architectures/arch-grayskull.json');
    const wormholeArch = await import('data/architectures/arch-wormhole.json');

    const architectureJson = {
        [Architecture.GRAYSKULL]: grayskullArch.default,
        [Architecture.WORMHOLE]: wormholeArch.default,
    }[architecture];

    return Chip.CREATE_FROM_CHIP_DESIGN(architectureJson as ChipDesignJSON);
};

export const loadGraph = async (folderPath: string, graphName: string, architecture: Architecture): Promise<Chip> => {
    let chip = await loadChipFromArchitecture(architecture);
    const graphPath = path.join(folderPath, 'graph_descriptor', graphName, 'cores_to_ops.json');
    const graphDescriptorJson = await loadJsonFile(graphPath);

    chip = Chip.AUGMENT_FROM_GRAPH_DESCRIPTOR(chip, graphDescriptorJson as GraphDescriptorJSON);

    const queuesPath = path.join(folderPath, 'queue_descriptor', 'queue_descriptor.json');
    const queueDescriptorJson = await loadJsonFile(queuesPath);

    chip = Chip.AUGMENT_WITH_QUEUE_DETAILS(chip, queueDescriptorJson as QueueDescriptorJson);

    const analyzerResultsPath = path.join(folderPath, 'analyzer_results', graphName, 'graph_perf_report_per_op.json');
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
                 * The node ID keys in the perf analyzer results file don't have the chip ID (device ID) component.
                 * We're forcing chip ID to 0 here, since for now we're only dealing with single-graph temporal epochs.
                 */
                return Object.entries(result['core-measurements']).map(([chipId, corePerfJson]) => [
                    `0-${chipId}`,
                    corePerfJson,
                ]);
            })
            .flat(),
    );

    // TODO: opAttributesMeasurements needs to be propagated to the data model

    chip = Chip.AUGMENT_WITH_PERF_ANALYZER_RESULTS(chip, analyzerResultsJsonWithChipIds);

    chip = Chip.AUGMENT_WITH_OP_PERFORMANCE(chip, opPerformanceByOp);

    return chip;
};
