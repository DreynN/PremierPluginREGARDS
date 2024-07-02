import { default as SearchDownloadFileActions } from './downloadFileCatalog/SearchDownloadFileActions'
import { default as getSearchDownloadFileReducer } from './downloadFileCatalog/SearchDownloadFileReducer'
import { default as getSearchDownloadFileSelectors } from './downloadFileCatalog/SearchDownloadFileSelectors'

const DownloadFileCl = {
    SearchDownloadFileActions,
    getSearchDownloadFileReducer,
    getSearchDownloadFileSelectors
}

export const DownloadFileClient = DownloadFileCl;