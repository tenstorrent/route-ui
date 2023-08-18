import React, {createContext} from 'react';
import SVGData from './DataStructures';
import {SVGJson} from './JSONDataTypes';

export interface SVGContext {
    svgData: SVGData | null;
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
