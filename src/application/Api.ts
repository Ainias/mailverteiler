import {JSONObject} from "js-helper";

export type RequestParams = Record<string, string | number | boolean>;


export class Api {
    private static instance = new Api();

    public static getInstance(){
        return this.instance;
    }

    private defaultOptions: RequestInit = {
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        }
    }

    private errorHandler

    public fetch<Result = any>(url: string, options?: RequestInit) {
        return fetch(url, {...this.defaultOptions, ...options}).then(r => r.json()) as Result;
    }

    get<Result = any>(url: string, params?: RequestParams, options?: RequestInit) {
        if (params) {
            url += "?" + Object.entries(params).map(([key, val]) => encodeURIComponent(key) + "=" + encodeURIComponent(val)).join("&");
        }
        return this.fetch<Result>(url, {...options, method: "GET"})
    }

    post<Result = any>(url: string, params?: JSONObject, options?: RequestInit) {
        return this.fetch<Result>(url, {...options, method: "POST", body: JSON.stringify(params)})
    }

    updateDefaultOptions(defaultOptions: RequestInit) {
        this.defaultOptions = {...this.defaultOptions, ...defaultOptions}
    }

    updateDefaultHeaders(defaultHeaders: Record<string, string>, replaceAll = false) {
        const headers = replaceAll ? defaultHeaders : {...this.defaultOptions.headers, ...defaultHeaders};
        this.updateDefaultOptions({headers});
    }
}
