import {prepareBrowserConnection} from "./prepareBrowserConnection";
import {prepareServerConnection} from "./prepareServerConnection";

export async function prepareConnection() {
    if (typeof window === "undefined") {
        return prepareServerConnection();
    }
    return prepareBrowserConnection();
}
