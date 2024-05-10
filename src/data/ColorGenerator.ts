// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

// colors have not been finilized yet
const colorList: string[] = [
    // '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    // '#00FF00', // Lime
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    // '#00FFFF', // Aqua
    '#FF00FF', // Fuchsia
    '#FF4500', // OrangeRed
    'rgb(91,131,19)',
    // '#ADFF2F', // GreenYellow
    '#9400D3', // DarkViolet
    '#FFD700', // Gold
    '#1E90FF', // DodgerBlue
    '#007500', // LimeGreen
    '#FF69B4', // HotPink
    '#BA55D3', // MediumOrchid
    '#7FFF00', // Chartreuse
    // '#DC143C', // Crimson
    // '#F08080', // LightCoral
    '#B22222', // FireBrick
];

const opColors = [
    'rgb(63,181,143)',
    'rgb(74,217,225)',
    'rgb(52,163,188)',
    'rgb(136,217,141)',
    'rgb(113, 168, 31)',
    'rgb(152,218,29)',
    'rgb(96,157,255)',
    'rgb(187,141,255)',
    'rgb(95,188,255)',
    'rgb(193,161,201)',
    'rgb(255,137,229)',
    'rgb(209,189,201)',
    'rgb(252,194,251)',
    'rgb(209,109,255)',
    'rgb(202,215,212)',
    'rgb(201,151,13)',
    'rgb(250,163,140)',
    'rgb(255,92,111)',
    'rgb(247,147,30)',
    'rgb(247,66,78)',
    'rgb(227,215,105)',
    'rgb(158,158,158)',
    'rgb(23,244,111)',
];

function* colorGenerator(): IterableIterator<string> {
    let i = 0;
    while (true) {
        yield colorList[i];
        i = (i + 1) % colorList.length;
    }
}

function* opColorGenerator(): IterableIterator<string> {
    let i = 0;
    while (true) {
        yield opColors[i];
        i = (i + 1) % opColors.length;
    }
}

const getNextColor = colorGenerator();
const getNextGroupColor = opColorGenerator();
const pipeMap = new Map<string, string>();
const groupMap = new Map<string, string>();
const getPipeColor = (pipeId: string): string => {
    if (!pipeMap.has(pipeId)) {
        pipeMap.set(pipeId, getNextColor.next().value);
    }
    return pipeMap.get(pipeId) || '#ffffff';
};
export const getGroupColor = (groupName: string): string | undefined => {
    if (!groupMap.has(groupName)) {
        groupMap.set(groupName, getNextGroupColor.next().value);
    }
    return groupMap.get(groupName);
};

export default getPipeColor;
