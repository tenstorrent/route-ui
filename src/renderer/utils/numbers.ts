// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

export const valueRatio = (a: any, b: any) => {
    const parsedA = Number(a);
    const parsedB = Number(b);

    if (Number.isNaN(parsedA) || Number.isNaN(parsedB)) {
        return 0;
    }

    if (a === 0) {
        return 0;
    }

    return Math.abs(parsedB / parsedA);
};

export const numberFormatter = (value: any, unit = '', fractionDigits = 2) => {
    const formatter = Intl.NumberFormat('en-US', { maximumFractionDigits: fractionDigits });
    const parsedValue = Number.parseFloat(value);

    if (Number.isNaN(parsedValue)) {
        return 'N/A';
    }

    return `${formatter.format(parsedValue)}${unit}`;
};

/**
 * @description Convert number to hex string for rendering
 */
export const toHex = (num: number): string => {
    if (num < 0) {
        // handling negative numbers as a 32-bit unsigned integer
        return toHex(0xffffffff + num + 1);
    }
    return `0x${num.toString(16).toUpperCase()}`;
};

export const formatSize = (number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
};

/**
 * @description  Pretty print 10 base address for memory legend
 */
export const prettyPrintAddress = (address: number | null, memorySize: number): string => {
    if (address === null) {
        return '0'.padStart(memorySize.toString().length, '0');
    }

    return address.toString().padStart(memorySize.toString().length, '0');
};
