import React, {createContext} from 'react';
import SVGData, {SVGJson} from './DataStructures';

export interface SVGContext {
    svgData: SVGData;
    setSvgData: (data: SVGData) => void;
}

const DataSource: React.Context<SVGContext> = createContext<SVGContext>({
    // @ts-ignore
    svgData: new SVGData(<SVGJson>{nodes: []}),
    setSvgData: () => {
        throw Error('Not implemented');
    },
});

export default DataSource;
