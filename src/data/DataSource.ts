import React, { createContext } from 'react';
import SVGData from './DataStructures';

const DataSource = createContext<SVGData>(new SVGData(null));
export default DataSource;
