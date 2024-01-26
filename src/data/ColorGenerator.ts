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
    '#0000ff',
    '#008df8',
    '#0092ff',
    '#00a2ff',
    '#00b0ff',
    '#00bfff',
    '#00c5c7',
    '#00d8eb',
    '#00dc84',
    '#00fbac',
    '#00ff00',
    '#00ff9c',
    '#00ffff',
    '#0271b6',
    '#12c3e2',
    '#19cde6',
    '#1bccfd',
    '#1ebb2b',
    '#2186ec',
    '#21f6bc',
    '#25c141',
    '#2f9ded',
    '#3eb383',
    '#44b4cc',
    '#44b4cc',
    '#53eaa8',
    '#5ffa68',
    '#5ffa68',
    '#60fdff',
    '#60fdff',
    '#67fff0',
    '#6871ff',
    '#6871ff',
    '#6d43a6',
    '#6e49cb',
    '#76c1ff',
    '#7d53e7',
    '#86cbfe',
    '#8ce10b',
    '#9933cc',
    '#99d6fc',
    '#9a5feb',
    '#abe15b',
    '#bd35ec',
    '#ca30c7',
    '#ccff04',
    '#d57bff',
    '#d682ec',
    '#db3b21',
    '#db501f',
    '#df95ff',
    '#e41951',
    '#e5e5e5',
    '#e6aefe',
    '#f5f5f5',
    '#f6188f',
    '#f841a0',
    '#f85a21',
    '#f97137',
    '#faf945',
    '#fc6d26',
    '#fca013',
    '#fca121',
    '#fdf454',
    '#fdf834',
    '#ff0000',
    '#ff000f',
    '#ff0051',
    '#ff00ff',
    '#ff2740',
    '#ff5680',
    '#ff6517',
    '#ff6600',
    '#ff6e67',
    '#ff6e67',
    '#ff7092',
    '#ff8aa4',
    '#ffb900',
    '#ffcc00',
    '#ffd242',
    '#fff787',
    '#fffa6a',
    '#fffc58',
    '#fffc67',
    '#fffc67',
    '#ffff00',
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
