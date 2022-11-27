import { prepareBrowserConnection } from './prepareBrowserConnection';
import { prepareServerConnection } from './prepareServerConnection';

export function prepareConnection() {
    if (typeof window !== 'undefined') {
        return prepareBrowserConnection();
    }
    return prepareServerConnection();
}
