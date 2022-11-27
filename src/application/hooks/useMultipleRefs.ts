import { MutableRefObject, useMemo, useRef } from 'react';

export function useMultipleRefs<Type>(size: number, initialValues: Type[] = []) {
    const savedSize = useRef(size);
    if (size !== savedSize.current) {
        throw new Error(`useMultipleRefs-Error: size cannot be changed! Got ${size} but expected ${savedSize.current}`);
    }
    const refs: MutableRefObject<Type>[] = useMemo(() => [], []);
    refs.length = 0;
    for (let i = 0; i < size; i++) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        refs.push(useRef<Type>(initialValues[i]));
    }
    return refs;
}
