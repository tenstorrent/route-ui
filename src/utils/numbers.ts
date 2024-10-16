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

export const formatToHex = (number: number, numberSize = 8): string => {
    const absoluteNumber = Math.abs(number);
    const signal = Math.sign(number);

    return `${signal < 0 ? '-' : ''}0x${absoluteNumber.toString(16).padStart(numberSize, '0').toUpperCase()}`;
};

export const formatSize = (number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
};

export const formatMemoryAddress = (address: number | null, maxSize: number): string => {
    if (address === null) {
        return '0'.padStart(Math.trunc(maxSize).toString().length, '0');
    }

    return address.toString().padStart(Math.trunc(maxSize).toString().length, '0');
};
