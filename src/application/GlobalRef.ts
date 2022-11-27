export class GlobalRef<T> {
    private readonly sym: symbol;

    constructor(uniqueName: string) {
        this.sym = Symbol.for(uniqueName);
    }

    value() {
        return (global as any)[this.sym] as T | undefined;
    }

    typedValue() {
        return (global as any)[this.sym] as T;
    }

    setValue(value: T) {
        (global as any)[this.sym] = value;
    }
}
