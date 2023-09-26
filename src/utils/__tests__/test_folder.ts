import fs from 'fs';
import path from 'path';
import {readDirEntries, findFile, validateFolder} from '../Folder';

describe('Folder utilities:', () => {
    describe('readDirEntries', () => {
        it('returns directory entries when given a path', async () => {
            const dirPath = 'src/utils/__tests__/testcase_example';

            const expectedNames = ['file_1.json', 'file_2.json', 'subdirectory'];

            const actualEntryNames = (await readDirEntries(dirPath)).map((entry) => entry.name);

            expect(actualEntryNames).toEqual(expectedNames);
        });
    });
    describe('findFile', () => {
        it('finds a file in a directory and returns its absolute path', async () => {
            const dirPath = 'src/utils/__tests__/testcase_example';
            const query = 'file_1.json';

            const queryResult = await findFile(dirPath, query);

            expect([path.join(dirPath, query)]).toEqual(queryResult);
        });
    });
});
