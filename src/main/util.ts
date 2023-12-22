/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 1212;
        const url = new URL(`http://localhost:${port}`);
        url.pathname = htmlFileName;
        return url.href;
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

/**
 * Generate runtime data for missing files.
 * dev use only
 */
export const generateRuntimeData = () => {
    let output = '';
    for (let i = 0; i < 32; i++) {
        const e = i;
        const string = `test_unary_chip${e}:
  epoch_id: 0
  target_device: ${e}\n`;
        output += string;
    }
    console.log(output);
};
