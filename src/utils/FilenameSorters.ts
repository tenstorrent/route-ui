// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

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

export function sortPerfAnalyzerGraphRelationships(graphRelationships: GraphRelationship[]) {
    const sortedRelationships = graphRelationships.sort((a, b) => {
        const temporalEpochDelta = a.temporalEpoch - b.temporalEpoch;
        const chipIdDelta = a.chipId - b.chipId;

        const [, aFirstDigit = '0', aSecondDigit = '0', aThirdDigit = '0'] = PERF_ANALYZER_REGEX.exec(a.name) ?? [];
        const [, bFirstDigit = '0', bSecondDigit = '0', bThirdDigit = '0'] = PERF_ANALYZER_REGEX.exec(b.name) ?? [];

        const firstDigitDelta = Number.parseInt(aFirstDigit, 10) - Number.parseInt(bFirstDigit, 10);
        const secondDigitDelta = Number.parseInt(aSecondDigit, 10) - Number.parseInt(bSecondDigit, 10);
        const thirdDigitDelta = Number.parseInt(aThirdDigit, 10) - Number.parseInt(bThirdDigit, 10);

        return temporalEpochDelta || chipIdDelta || firstDigitDelta || secondDigitDelta || thirdDigitDelta;
    });

    return sortedRelationships;
}
