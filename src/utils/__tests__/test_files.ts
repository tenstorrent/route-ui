/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { findFiles, getAvailableGraphNames, readDirEntries, validatePerfResultsFolder } from '../FileLoaders';

const generateRandomKey = () => Math.random().toString(36).substring(2);

const testDirPath = path.join(os.tmpdir(), 'route-ui-test', generateRandomKey());

describe('Folder utilities:', () => {
    beforeAll(() => {
        fs.mkdirSync(testDirPath, { recursive: true });
    });

    afterAll(() => {
        fs.rmSync(testDirPath, { recursive: true });
    });

    describe('readDirEntries', () => {
        const dirPath = path.join(testDirPath, 'readDirEntries');
        beforeAll(() => {
            fs.mkdirSync(dirPath);
            fs.writeFileSync(path.join(dirPath, 'file_1.json'), '');
            fs.writeFileSync(path.join(dirPath, 'file_2.json'), '');
            fs.mkdirSync(path.join(dirPath, 'subdirectory'));
        });
        afterAll(() => {
            fs.rmSync(dirPath, { recursive: true });
        });
        it('returns directory entries when given a path', async () => {
            const expectedNames = ['file_1.json', 'file_2.json', 'subdirectory'];

            const actualEntryNames = (await readDirEntries(dirPath)).map((entry) => entry.name);

            expect(actualEntryNames).toEqual(expectedNames);
        });
    });

    describe('findFile', () => {
        const dirPath = path.join(testDirPath, 'findFile');
        beforeAll(() => {
            fs.mkdirSync(dirPath);
            fs.writeFileSync(path.join(dirPath, 'file_1.json'), '');
            fs.writeFileSync(path.join(dirPath, 'file_2.json'), '');
            fs.mkdirSync(path.join(dirPath, 'path_A'));
            fs.mkdirSync(path.join(dirPath, 'path_A/path_AA'));
            fs.mkdirSync(path.join(dirPath, 'path_A/path_AA/target'));
            fs.mkdirSync(path.join(dirPath, 'path_A/path_AB'));
            fs.mkdirSync(path.join(dirPath, 'path_A/path_AB/target'));
        });
        afterAll(() => {
            fs.rmSync(dirPath, { recursive: true });
        });
        it('finds a file in a directory and returns its absolute path', async () => {
            const query = 'file_1.json';

            const queryResult = await findFiles(dirPath, query);

            expect([path.join(dirPath, query)]).toEqual(queryResult);
        });
        it('finds a directory two levels deep in a directory and returns its absolute path', async () => {
            const query = 'path_AA';

            const queryResult = await findFiles(dirPath, query, { isDir: true, maxDepth: 1 });

            expect(queryResult).toEqual([path.join(dirPath, 'path_A', query)]);
        });
        it('finds two matching directories at the same depth and returns their absolute paths', async () => {
            const query = 'target';

            const queryResult = await findFiles(dirPath, query, { isDir: true, maxDepth: 2 });

            const expectedPaths = [
                path.join(dirPath, 'path_A/path_AA', query),
                path.join(dirPath, 'path_A/path_AB', query),
            ];

            expect(queryResult).toEqual(expectedPaths);
        });
    });

    describe('validatePerfResultsFolder', () => {
        describe('when given a folder that is not named "perf_results"', () => {
            const dirPath = path.join(testDirPath, 'something_else');
            it('returns false, with an error message', async () => {
                const [isValid, errorMessage] = await validatePerfResultsFolder(dirPath);

                expect(isValid).toBe(false);
                expect(errorMessage).toBe('Folder name must be "perf_results"');
            });
        });

        describe('when the folder does not exist', () => {
            const perfResultsPath = path.join(testDirPath, 'perf_results');
            beforeAll(() => {
                if (fs.existsSync(perfResultsPath)) {
                    fs.rmSync(perfResultsPath, { recursive: true });
                }
            });
            it('returns false, with an error message', async () => {
                const [isValid, errorMessage] = await validatePerfResultsFolder(perfResultsPath);

                expect(isValid).toBe(false);
                expect(errorMessage).toBe('Folder does not exist');
            });
        });

        describe('when given an existing folder that is named "perf_results"', () => {
            const perfResultsPath = path.join(testDirPath, 'perf_results');
            beforeEach(() => {
                fs.mkdirSync(perfResultsPath);
            });
            afterEach(() => {
                fs.rmSync(perfResultsPath, { recursive: true });
            });
            describe('when the folder does not contain required subfolders', () => {
                it('returns false, with an error message', async () => {
                    const [isValid, errorMessage] = await validatePerfResultsFolder(perfResultsPath);

                    expect(isValid).toBe(false);
                    expect(errorMessage).toBe(
                        'Selected folder is missing required subdirectory: analyzer_folder, graph_descriptors',
                    );
                });
            });

            describe('when the folder contains the required subfolders', () => {
                beforeEach(() => {
                    fs.mkdirSync(path.join(perfResultsPath, 'analyzer_results'));
                    fs.mkdirSync(path.join(perfResultsPath, 'graph_descriptors'));
                });
                it('returns true, with no error message', async () => {
                    const [isValid, errorMessage] = await validatePerfResultsFolder(perfResultsPath);

                    expect(isValid).toBe(true);
                    expect(errorMessage).toBe(null);
                });
            });
        });
    });

    describe('getAvailableGraphs', () => {
        const perfResultsPath = path.join(testDirPath, 'perf_results');
        const graphDescriptorsPath = path.join(perfResultsPath, 'graph_descriptors');
        const graphNames = ['fwd_0', 'fwd_1', 'fwd_2'];
        beforeEach(() => {
            fs.mkdirSync(graphDescriptorsPath, { recursive: true });
            graphNames.forEach((graphName) => {
                fs.mkdirSync(path.join(graphDescriptorsPath, graphName));
                fs.writeFileSync(path.join(graphDescriptorsPath, graphName, 'graph_descriptor.json'), '');
            });
        });
        afterEach(() => {
            fs.rmSync(perfResultsPath, { recursive: true });
        });
        it('Should list available graphs from a perf_results folder', () => {
            const actualGraphNames = getAvailableGraphNames(perfResultsPath);
            return expect(actualGraphNames).resolves.toEqual(graphNames);
        });
    });
});
