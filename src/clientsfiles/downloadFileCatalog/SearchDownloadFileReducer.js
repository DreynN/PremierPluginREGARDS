import { DownloadFileReducers } from "@regardsoss/store-utils";
import SearchDownloadFileActions from "./SearchDownloadFileActions";

export default function getSearchDownloadFileReducer(namespace) {
    const instance = new DownloadFileReducers(new SearchDownloadFileActions(namespace))
    return (state, action) => instance.reduce(state, action)
}