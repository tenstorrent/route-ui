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
    '#00c5c7',
    '#ca30c7',
    '#e5e5e5',
    '#5ffa68',
    '#ff6600',
    '#e6aefe',
    '#ccff04',
    '#99d6fc',
    '#f5f5f5',
    '#00ff9c',
    '#d57bff',
    '#1bccfd',
    '#f841a0',
    '#fdf834',
    '#8ce10b',
    '#ff2740',
    '#67fff0',
    '#ff8aa4',
    '#ffb900',
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
