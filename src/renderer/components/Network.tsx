/* eslint-disable no-console */

import dns from 'dns';

import fs from 'fs';
import fsPromises from 'fs/promises';

import path from 'path';
import { promisify } from 'util';
import { SpawnSyncOptionsWithBufferEncoding, exec, spawnSync } from 'child_process';

export interface Workspace {
    remote: boolean;
    sshHost?: string;
    sshPort?: string;
    path: string;
    outputPath: string;
}

export interface IPerfResults {
    testname: string; // name of the test that the perf results folder belongs to
    path: string; // absolute path to the perf results folder
}

/** Runs a shell command and returns the output buffers on success (status=0).
 *
 * @param timeout: Pass this timeout (ms) to spawnSync options. Throws error on timeout.
 *
 * Throws error on failure (nonzero status). */
export async function runShellCommand(
    cmd: string,
    params: string[],
    options?: SpawnSyncOptionsWithBufferEncoding,
): Promise<[stdout: Buffer | null, stderr: Buffer | null]> {
    console.log('RUN COMMAND: ', cmd, params);
    const result = spawnSync(cmd, params, {
        stdio: ['ignore', 'pipe', 'pipe'],
        ...options,
    });
    const [_, stdout, stderr] = result.output;
    if (result.error) {
        throw result.error;
    }
    // eslint-disable-next-line eqeqeq
    if (result.status != 0) {
        throw Error(`Command ${cmd} failed with status ${result.status}.\n${result.stderr.toString()}`);
    }
    return [stdout, stderr];
}

export function sshWrapCmd(w: Workspace, cmd: string): string[] {
    return [
        w.sshHost!,
        '-p',
        w.sshPort!, // remote connection
        'bash',
        '-c',
        `'${cmd}'`,
    ];
}

export function fnvHash(str: string): number {
    // eslint-disable-next-line camelcase
    const FNV_offset_basis = 2166136261;
    // eslint-disable-next-line camelcase
    const FNV_prime = 16777619;

    return (
        // eslint-disable-next-line no-bitwise
        Array.from(str).reduce(
            // eslint-disable-next-line no-bitwise
            (s: number, c: string) => Math.imul(s, FNV_prime) ^ c.charCodeAt(0),
            FNV_offset_basis,
        ) >>> 0
    );
}

export function getWorkspaceId(w: Workspace): string {
    console.log(`WORKSPACE PATH: ${w.path}`);
    const hash = fnvHash(w.path);
    if (w.remote) {
        const remoteString = `${hash}-${w.sshHost}`;
        console.log(`REMOTE WORKSPACE ID: ${remoteString}`);
        return remoteString;
    }
    return hash.toString();
}

export const escapeWhitespace = (str: string) => str.replace(/(\s)/g, '\\$1');

// Required for connecting to a socket on localhost
dns.setDefaultResultOrder('ipv4first');

/** setStarted/setConnected/setVerified are callbacks for GUI to show progress
 *
 * return value is a string with msg on why the verification failed, or empty string
 * if everything passed */
export const verifyRemoteWorkspace = async (
    w: Workspace,
    setConnected: () => void,
    setVerified: () => void,
): Promise<void> => {
    await testWorkspaceConnection(w);
    setConnected();
    await verifyWorkspacePath(w);
    setVerified();
};

export const testWorkspaceConnection = async (w: Workspace): Promise<void> => {
    try {
        await promisify(exec)(`ssh ${w.sshHost} -p ${w.sshPort} bash -c 'echo "connected"'`, { timeout: 8000 });
    } catch (e: any) {
        throw Error(`Failed to connect to workspace: ${e.toString()}`, {
            cause: e,
        });
    }
};

const verifyWorkspacePath = async (w: Workspace): Promise<void> => {
    try {
        await runShellCommand('ssh', sshWrapCmd(w, `ls ${w.path}`));
    } catch (e: any) {
        throw Error(`Failed to verify workspace path: ${e.toString()}`, {
            cause: e,
        });
    }
};

/** Fetches a list of directories in the given workspace which contain `perf_results` subdirectories */
export async function findWorkspacePerfDumpDirectories(workspace: Workspace): Promise<IPerfResults[]> {
    const parseResults = (results: string): IPerfResults[] =>
        results
            .split('\n')
            .filter((s) => s.length > 0)
            .map((directory) => ({
                testname: directory.split('/').slice(-2, -1)[0],
                path: directory,
            }));
    console.log('Finding remote perf dump directories');
    const findParams = [
        '-L',
        workspace.outputPath,
        '-mindepth',
        '1',
        '-maxdepth',
        '3',
        '-type',
        'd',
        '-name',
        'perf_results',
    ];
    let stdout: Buffer | null;
    if (workspace.remote) {
        if (!workspace.sshHost || !workspace.sshPort) {
            throw Error('Workspace does not have ssh host/port set');
        }
        [stdout] = await runShellCommand('ssh', sshWrapCmd(workspace, `find ${findParams.join(' ')}`));
    } else {
        [stdout] = await runShellCommand('find', findParams);
    }
    return stdout ? parseResults(stdout.toString()) : [];
}

/** Syncs the remote directory containing a perf dump.
 *
 * Deletes the local copy of the previously loaded perf dump if it is different from the new directory.
 *
 * Implemented with rsync, only works on MacOS/Linux. Can only be called from Renderer process. */
export async function syncRemotePerfDump(workspace: Workspace, perfResults: IPerfResults): Promise<string> {
    const remote = await import('@electron/remote');
    if (!workspace) {
        throw Error('Workspace not set');
    }

    if (!workspace.remote) {
        throw Error('Workspace is not remote');
    }

    const testId = `${getWorkspaceId(workspace)}-${perfResults.testname.replace(/\s/g, '_')}`;
    console.log('SYNC REMOTE PERF DUMP', testId);

    const configDir = remote.app.getPath('userData');
    const localCopyPath = path.join(configDir, 'perfdatatmp/');
    if (!fs.existsSync(localCopyPath)) {
        await fsPromises.mkdir(localCopyPath);
    }

    const dirContents = await fsPromises.readdir(localCopyPath);
    if (dirContents.length && !dirContents.includes(testId)) {
        // Purge the remote copy directory
        await Promise.all(
            dirContents.map(async (file) =>
                fsPromises.rm(path.join(localCopyPath, file), {
                    recursive: true,
                    force: true,
                }),
            ),
        );
    }

    const destinationPath = path.join(localCopyPath, testId);
    console.log('PATH BEFORE:', perfResults.path);
    const sourcePath = perfResults.path;
    console.log('PATH AFTER:', sourcePath);
    const baseOptions = [
        '-s',
        '-az',
        '-e',
        `'ssh -p ${workspace.sshPort}'`,
        '--delete',
        `${workspace.sshHost}:${escapeWhitespace(sourcePath)}`,
        escapeWhitespace(destinationPath),
    ];
    try {
        await runShellCommand('rsync', baseOptions, { shell: true });
    } catch (e: any) {
        console.log('Initial RSYNC attempt failed: ', e.toString());
        // Try again, this time without `-s` option & quotes around source path
        baseOptions[4] = `'${baseOptions[4]}'`;
        await runShellCommand('rsync', baseOptions.slice(1), { shell: true });
    }
    return destinationPath;
}
