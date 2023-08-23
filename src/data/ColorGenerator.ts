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
    'rgb(57,146,131)',
    'rgb(74,217,225)',
    'rgb(10,79,78)',
    'rgb(136,217,141)',
    'rgb(91,131,19)',
    'rgb(152,218,29)',
    'rgb(26,79,163)',
    'rgb(164,126,224)',
    'rgb(65,165,238)',
    'rgb(114,53,155)',
    'rgb(228,91,199)',
    'rgb(90,62,79)',
    'rgb(252,194,251)',
    'rgb(148,43,243)',
    'rgb(202,215,212)',
    'rgb(125,68,0)',
    'rgb(250,163,140)',
    'rgb(196,54,33)',
    'rgb(247,147,30)',
    'rgb(156,26,84)',
    'rgb(227,215,105)',
    'rgb(132,132,132)',
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
