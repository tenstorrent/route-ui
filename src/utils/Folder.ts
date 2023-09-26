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
    options?: {isDir?: boolean; maxDepth?: number},
): Promise<string[]> {
    const {isDir = false, maxDepth = 0} = options || {};
    if (maxDepth < 0) throw new Error('maxDepth must be non-negative');

    const allEntries = await readDirEntries(searchPath);
    const matches = allEntries.filter(
        (file) => ((isDir && file.isDirectory()) || (!isDir && file.isFile())) && file.name === searchQuery
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
            findFile(path.join(searchPath, dirEntry.name), searchQuery, {
                isDir,
                maxDepth: maxDepth - 1,
            })
        )
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
