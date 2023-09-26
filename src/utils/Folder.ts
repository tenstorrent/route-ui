import fs, {Dirent} from 'fs';
import path from 'path';

export async function readDirEntries(dirPath: string): Promise<Dirent[]> {
    return new Promise<Dirent[]>((resolve, reject) => {
        fs.readdir(dirPath, {withFileTypes: true}, (err, files) => {
            if (err) reject(err);
            else resolve(files);
        });
    });
}

export async function findFile(
    searchPath: string,
    searchQuery: string,
    isDir = false,
    maxDepth = 2
): Promise<string[]> {
    const files = (await readDirEntries(searchPath)).filter(
        (file) =>
            ((isDir && !file.isDirectory()) || (!isDir && file.isFile())) &&
            file.name === searchQuery
    );
    if (files.length > 0) {
        const results = files.map((dirEntry) => path.join(searchPath, dirEntry.name));
        return results;
    }
    if (maxDepth === 0) {
        return [];
    }
    const subfolderResults = await Promise.all(
        files
            .filter((dirEntry) => dirEntry.isDirectory())
            .map((dirEntry) => findFile(dirEntry.path, searchQuery, isDir, maxDepth - 1))
    );
    return subfolderResults.flat();
}

export async function validateFolder(dirPath: string) {
    const REQUIRED_SUBFOLDERS = ['analyzer_results', 'graph_descriptors'];
    if (!fs.existsSync(dirPath)) {
        return false;
    }
    const directoryContents = await readDirEntries(dirPath);

    return true;
}
