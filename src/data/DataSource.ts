import React, { createContext } from 'react';
import SVGData from './DataStructures';

interface SVGContext {
    svgData: SVGData;
    setSvgData: (data: SVGData) => void;
}

const DataSource = createContext<SVGContext>({
    svgData: new SVGData({ nodes: [] }),
    setSvgData: () => {
        throw Error('Not implemented');
    },
});

export default DataSource;
