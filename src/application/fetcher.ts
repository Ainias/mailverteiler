import {JSONObject, JSONValue} from "js-helper";

let savedDefaultOptions: RequestInit = {
    credentials: "same-origin",
    headers: {
        "Content-Type": "application/json"
    }
}

export type RequestParams = Record<string, string | number | boolean>;

export function updateDefaultOptions(defaultOptions: RequestInit) {
    savedDefaultOptions = {...savedDefaultOptions, ...defaultOptions}
}

export function fetcher(url: string, options?: RequestInit) {
    return fetch(url, {...savedDefaultOptions, ...options}).then(r => r.json());
}

export function get(url: string, params?: RequestParams, options?: RequestInit) {
    if (params) {
        url += "?" + Object.entries(params).map(([key, val]) => encodeURIComponent(key) + "=" + encodeURIComponent(val)).join("&");
    }
    return fetcher(url, {...options, method: "GET"})
}

export function post(url: string, params?: JSONObject, options?: RequestInit) {
    return fetcher(url, {...options, method: "POST", body: JSON.stringify(params)})
}
