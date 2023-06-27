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

function* colorGenerator(): IterableIterator<string> {
    let i = 0;
    while (true) {
        yield colorList[i];
        i = (i + 1) % colorList.length;
    }
}

const getNextColor = colorGenerator();
const pipeMap = new Map<string, string>();
const getPipeColor = (pipeId: string) => {
    if (!pipeMap.has(pipeId)) {
        pipeMap.set(pipeId, getNextColor.next().value);
    }
    return pipeMap.get(pipeId);
};
export default getPipeColor;
