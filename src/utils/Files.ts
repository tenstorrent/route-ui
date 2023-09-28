import fs, { Dirent } from 'fs';
import path from 'path';

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
        const results = matches.map((dirEntry) => path.join(searchPath, dirEntry.name));
        return results;
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
    const graphFolderExists =
        (await findFiles(dirPath, 'graph_descriptors', { isDir: true, maxDepth: 0 })).length === 1;

    if (analyzerFolderExists && graphFolderExists) {
        return [true, null];
    }
    const missingSubfolders: string[] = [];
    if (!analyzerFolderExists) {
        missingSubfolders.push('analyzer_folder');
    }
    if (!graphFolderExists) {
        missingSubfolders.push('graph_descriptors');
    }

    return [false, `Selected folder is missing required subdirectory: ${missingSubfolders.join(', ')}`];
};

export const getAvailableGraphNames = async (perfResultsPath: string): Promise<string[]> => {
    const graphDescriptorsPath = path.join(perfResultsPath, 'graph_descriptors');
    const graphDirEntries = await readDirEntries(graphDescriptorsPath);
    return graphDirEntries.map((graphDirEntry) => graphDirEntry.name).filter((name) => !name.startsWith('.'));
};
