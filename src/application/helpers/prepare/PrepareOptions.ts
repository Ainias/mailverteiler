export type PrepareOptions = {
    validateUser: false
    accesses?: undefined
} | {
    validateUser: true
    needsUser?: false
    accesses?: undefined
} | {
    validateUser: true
    needsUser: true
    accesses?: undefined | string | string[]
}
