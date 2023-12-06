const NETLIST_ANALYZER_REGEX = /^\D*(\d+)\D*(\d*).yaml$/;
const PERF_ANALYZER_REGEX = /^\D+(\d+)\D*(\d*)\D*(\d*)$/;

export function sortNetlistAnalyzerFiles(filenames: string[]) {
    return filenames.sort((a, b) => {
        const parsedA = NETLIST_ANALYZER_REGEX.exec(a);
        const parsedB = NETLIST_ANALYZER_REGEX.exec(b);
        console.log({ parsedA, parsedB });
        if (!parsedA?.[1] || !parsedB?.[1]) {
            return 1;
        }
        if (Number(parsedA[1]) === Number(parsedB[1])) {
            return Number(parsedA[2]) > Number(parsedB[2]) ? 1 : -1;
        }
        return Number(parsedA[1]) > Number(parsedB[1]) ? 1 : -1;
    });
}

export function sortPerfAnalyzerFiles(filenames: string[]) {
    return filenames.sort((a, b) => {
        const parsedA = PERF_ANALYZER_REGEX.exec(a);
        const parsedB = PERF_ANALYZER_REGEX.exec(b);
        if (!parsedA?.[1] || !parsedB?.[1]) {
            return 1;
        }
        if (Number(parsedA[1]) === Number(parsedB[1])) {
            if (Number(parsedA[2]) === Number(parsedB[2])) {
                return Number(parsedA[3]) > Number(parsedB[3]) ? 1 : -1;
            }
            return Number(parsedA[2]) > Number(parsedB[2]) ? 1 : -1;
        }
        return Number(parsedA[1]) > Number(parsedB[1]) ? 1 : -1;
    });
}
