/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import {
    getDetailedViewHeight,
    getDetailedViewOpenState,
    getDockOpenState,
    getIsLoadingFolder,
} from 'data/store/selectors/uiState.selectors';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { INITIAL_DETAILS_VIEW_HEIGHT } from '../../data/constants';
import TenstorrentLogo from '../../main/assets/TenstorrentLogo';
import GridRender from '../components/GridRender';
import { SideBar } from '../components/SideBar';
import TopHeaderComponent from '../components/TopHeaderComponent';
import BottomDock from '../components/bottom-dock/BottomDock';
import { GridSidebar } from '../components/grid-sidebar/GridSidebar';
import PropertiesPanel from '../components/properties-panel/PropertiesPanel';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import './MainRouteRenderer.scss';

export interface MainRouteRendererProps {}

const MainRouteRenderer: React.FC<MainRouteRendererProps> = () => {
    const isDockOpen = useSelector(getDockOpenState);
    const isDetailedViewOpen = useSelector(getDetailedViewOpenState);
    const detailedViewHeight = useSelector(getDetailedViewHeight);
    const loading = useSelector(getIsLoadingFolder);
    const graphOnChip = useContext(GraphOnChipContext).getActiveGraphOnChip();
    const { error } = usePerfAnalyzerFileLoader();

    return (
        <>
            <div
                className={`main-route ${isDockOpen ? 'dock-open' : ''} ${isDetailedViewOpen ? 'detailed-view-open' : ''} ${!loading && (error || !graphOnChip) ? 'invalid-data' : ''} ${loading ? 'loading-data' : ''}`}
                style={
                    {
                        '--js-bottom-dock-height': `${
                            isDetailedViewOpen ? detailedViewHeight : INITIAL_DETAILS_VIEW_HEIGHT
                        }px`,
                    } as React.CSSProperties
                }
            >
                <div className='header'>
                    <TenstorrentLogo />
                    <TopHeaderComponent />
                </div>
                <SideBar />
                <GridSidebar />
                <GridRender />
                <PropertiesPanel />
                <BottomDock isActive={isDockOpen} />
                <div className={`main-route-loading-overlay`}>
                    <p>Loading data...</p>
                </div>
            </div>
        </>
    );
};

export default MainRouteRenderer;
