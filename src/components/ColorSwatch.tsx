// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { type CSSProperties, type FC } from 'react';

import './ColorSwatch.scss';

interface ColorSwatchProps {
    isVisible: boolean;
    color?: string;
}

const ColorSwatch: FC<ColorSwatchProps> = ({ isVisible, color = 'transparent' }) => {
    return (
        <span
            className={`color-swatch ${isVisible ? '' : 'transparent'}`}
            style={{ '--js-color-swatch': color } as CSSProperties}
        />
    );
};

export default ColorSwatch;
