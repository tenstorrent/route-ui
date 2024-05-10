// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

export const isIterable = (value: unknown): value is Iterable<unknown> =>
    value !== null &&
    typeof value === 'object' &&
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === 'function';

export function* mapIterable<T, U>(iterable: Iterable<T>, f: (val: T) => U): Iterable<U> {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of iterable) {
        yield f(item);
    }
}

export function* filterIterable<T>(iterable: Iterable<T>, predicate: (val: T) => boolean): Iterable<T> {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of iterable) {
        if (predicate(item)) {
            yield item;
        }
    }
}

type NestedIterable<T> = Iterable<T> | Iterable<NestedIterable<T>>;

export function* flattenIterable<T>(iterable: NestedIterable<T>, depth = 1): Generator<T> {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of iterable) {
        if (!isIterable(item)) {
            yield item;
        } else if (depth > 0) {
            yield* flattenIterable(item);
        }
    }
}

export function reduceIterable<T, U>(
    iterable: Iterable<T>,
    initial: U,
    reducer: (accumulator: U, currentValue: T) => U,
) {
    let reduced = initial;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of iterable) {
        reduced = reducer(reduced, item);
    }
    return reduced;
}

export function forEach<T>(iterable: Iterable<T>, consumer: (value: T) => void) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of iterable) {
        consumer(item);
    }
}
