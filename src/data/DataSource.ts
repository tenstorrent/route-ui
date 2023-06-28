import React, {createContext} from 'react';
import SVGData from './DataStructures';

export interface SVGContext {
    svgData: SVGData;
    setSvgData: (data: SVGData) => void;
}

const DataSource: React.Context<SVGContext> = createContext<SVGContext>({
    svgData: new SVGData({nodes: []}),
    setSvgData: () => {
        throw Error('Not implemented');
    },
});

export default DataSource;
