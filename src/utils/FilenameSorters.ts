/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { GraphRelationship } from '../data/StateTypes';

const NETLIST_ANALYZER_REGEX = /^\D*(\d+)\D*(\d*).yaml$/;
const PERF_ANALYZER_REGEX = /^\D+(\d+)\D*(\d*)\D*(\d*)$/;

export function sortNetlistAnalyzerFiles(filenames: GraphRelationship[]) {
    return filenames.sort((a, b) => {
        const parsedA = NETLIST_ANALYZER_REGEX.exec(a.name);
        const parsedB = NETLIST_ANALYZER_REGEX.exec(b.name);
        if (!parsedA?.[1] || !parsedB?.[1]) {
            return 1;
        }
        if (Number(parsedA[1]) === Number(parsedB[1])) {
            return Number(parsedA[2]) > Number(parsedB[2]) ? 1 : -1;
        }
        return Number(parsedA[1]) > Number(parsedB[1]) ? 1 : -1;
    });
}

export function sortPerfAnalyzerGraphnames(filenames: GraphRelationship[]) {
    return filenames.sort((a, b) => {
        const parsedA = PERF_ANALYZER_REGEX.exec(a.name);
        const parsedB = PERF_ANALYZER_REGEX.exec(b.name);
        if (!parsedA?.[1] || !parsedB?.[1]) {
            return 1;
        }
        if (Number(parsedA[1]) === Number(parsedB[1])) {
            if (Number(parsedA[2]) === Number(parsedB[2])) {
                return Number(parsedA[3]) > Number(parsedB[3]) ? 1 : -1;
            }
            return Number(parsedA[2]) > Number(parsedB[2]) ? 1 : -1;
        }
        return Number(parsedA[1]) > Number(parsedB[1]) ? 1 : -1;
    });
}
