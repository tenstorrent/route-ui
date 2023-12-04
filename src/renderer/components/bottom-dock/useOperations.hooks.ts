import DataSource from 'data/DataSource';
import { Operation } from 'data/GraphTypes';
import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';
import { useContext, useMemo, useState } from 'react';

type OperationsHook = {
    operations: Operation[];
    setSortingColumn: (criteria: keyof OpPerfJSON) => void;
};

function useOperations(): OperationsHook {
    const [sortingColumn, setSortingColumn] = useState<keyof OpPerfJSON>('kernel_total_runtime');
    const { chip } = useContext(DataSource);
    const operations = useMemo(() => {
        const inputOperations = [...(chip?.operations ?? [])];

        const sortedOperations = inputOperations.sort((a, b) =>
            a.details![sortingColumn] > b.details![sortingColumn] ? -1 : 1,
        );
        return sortedOperations;
    }, [sortingColumn, chip]);

    return { operations, setSortingColumn };
}

export default useOperations;
