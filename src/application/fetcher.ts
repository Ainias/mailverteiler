import {JSONObject} from "js-helper";

let savedDefaultOptions: RequestInit = {
    credentials: "same-origin",
    headers: {
        "Content-Type": "application/json"
    }
}


export function updateDefaultOptions(defaultOptions: RequestInit) {
    savedDefaultOptions = {...savedDefaultOptions, ...defaultOptions}
}

export function updateDefaultHeaders(defaultHeaders: Record<string, string>, replaceAll = false) {
    const headers = replaceAll ? defaultHeaders : {...savedDefaultOptions.headers, ...defaultHeaders};
    updateDefaultOptions({headers});
}

export function fetcher<Result = any>(url: string, options?: RequestInit) {
    return fetch(url, {...savedDefaultOptions, ...options}).then(r => r.json()) as Result;
}

export function get<Result = any>(url: string, params?: RequestParams, options?: RequestInit) {
    if (params) {
        url += "?" + Object.entries(params).map(([key, val]) => encodeURIComponent(key) + "=" + encodeURIComponent(val)).join("&");
    }
    return fetcher<Result>(url, {...options, method: "GET"})
}

export function post<Result = any>(url: string, params?: JSONObject, options?: RequestInit) {
    return fetcher<Result>(url, {...options, method: "POST", body: JSON.stringify(params)})
}
