import { DownloadFileClient } from '../clientsfiles/main'
import { ClientConfBuilder } from '@regardsoss/plugins-api'

const pluginName = 'nicotest'

const storeKey = 'file'
const actionsBuilder = (namespace) => new DownloadFileClient.SearchDownloadFileActions(namespace)
const reducerBuilder = (namespace) => DownloadFileClient.getSearchDownloadFileReducer(namespace)
const selectorsBuilder = (storePath) => DownloadFileClient.getSearchDownloadFileSelectors(storePath)

const clientInfoBuilder = new ClientConfBuilder(pluginName, storeKey)
  .setActionsBuilder(actionsBuilder)
  .setSelectorsBuilder(selectorsBuilder)
  .setReducerBuilder(reducerBuilder)

export function getFileClient(pluginInstanceId) {
  return clientInfoBuilder.getClient(pluginInstanceId)
}

export function getFileReducer(pluginInstanceId) {
  return clientInfoBuilder.getReducer(pluginInstanceId)
}
  