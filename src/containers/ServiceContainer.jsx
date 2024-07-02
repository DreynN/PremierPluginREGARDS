/**
 * Copyright 2017-2023 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
 *
 * This file is part of REGARDS.
 *
 * REGARDS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * REGARDS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with REGARDS. If not, see <http://www.gnu.org/licenses/>.
 **/
import { connect } from '@regardsoss/redux'
import { AccessShapes } from '@regardsoss/shape'
import { TargetEntitiesResolver } from '@regardsoss/plugins-api'
import { AuthenticationClient } from '@regardsoss/authentication-utils'
import { URIContentDisplayer } from '@regardsoss/components'
import { IFrameURLContentDisplayer } from '@regardsoss/components'
import { BasicSignalSelectors } from '@regardsoss/store-utils'
import { DownloadFileClient } from '../clientsfiles/main'
import { FilePreview } from '../components/FilePreview'
import withFileClient from './withFileClient'

/**
 * Main squelette plugin container
 * @author nicolas vongsanti
 */
export class ServiceContainer extends React.Component {
  /**
   * Redux: map state to props function
   * @param {*} state: current redux state
   * @param {*} props: (optional) current component properties (excepted those from mapStateToProps and mapDispatchToProps)
   * @return {*} list of component properties extracted from redux state
   */
  static mapStateToProps(state, props) {
    const { FileClient } = props;
    const token = AuthenticationClient.authenticationSelectors.getAccessToken(state);
    return {
      //TODO voir si c'est correct
      //fileClientRes: FileClient.selectors.getResult(state),
      token: token,
    }
  }

  /**
   * Redux: map dispatch to props function
   * @param {*} dispatch: redux dispatch function
   * @param {*} props: (optional)  current component properties (excepted those from mapStateToProps and mapDispatchToProps)
   * @return {*} list of component properties extracted from redux state
   */
  static mapDispatchToProps(dispatch, props) {
    const { FileClient, target } = props;
    return {
      fetchFile: (searchContext) => dispatch(FileClient.actions.getDownloadFile(searchContext)),
      // we apply partially the method getReducePromise to ignore dispatch reference at runtime
      getReducePromise: (reducer, initialValue) => TargetEntitiesResolver.getReducePromise(dispatch, target, reducer, initialValue),
    }
  }

  static propTypes = {
    // From runtime
    pluginInstanceId: PropTypes.string.isRequired,
    target: AccessShapes.PluginTarget.isRequired,
    configuration: AccessShapes.RuntimeConfiguration.isRequired,
    // From withFileClient()
    FileClient: PropTypes.shape({
      actions: PropTypes.instanceOf(DownloadFileClient.SearchDownloadFileActions),
      selectors: PropTypes.instanceOf(BasicSignalSelectors),
    }).isRequired,
    // From mapDispatchToProps
    fetchFile: PropTypes.func.isRequired,
    getReducePromise: PropTypes.func.isRequired, // partially applied reduce promise, see mapStateToProps and later code demo
    // From mapStateToProps
    token: PropTypes.string,
    //TODO chercher le type de donnée qui est retourné
    //fileClientRes: ,
  }

  state = {
    file: null,
    runtimeObjects: [],
  }

  componentDidMount() {
    // Start fetching and converting entities: append each new entity in array
    // Note: It isn't a good pratice to keep complete entities in memory as it result
    // in heavy memory load (just demonstrated here).
    const { getReducePromise, fetchFile, token } = this.props;
    getReducePromise((previouslyRetrieved, entity) => [...previouslyRetrieved, entity], [])
      .then(runtimeObjects => {
        //this.setState({ runtimeObjects });
        let reqParamsObject = {
          AIP_ID: runtimeObjects[0].content.virtualId,
          // TODO formulation à changer car il peut y avoir plusieurs fichiers RAWDATA
          checksum: runtimeObjects[0].content.files.RAWDATA[0].checksum,
          token: token
        };
        console.log('aipid', reqParamsObject.AIP_ID, ' et checksum', reqParamsObject.checksum);
        fetchFile(reqParamsObject).then((results) => {
          this.setState({file: results.payload, runtimeObjects: runtimeObjects });
          console.log('fichier: ', results.payload);
        })
        .catch(err => console.error('Could not retrieve get file', err));

      })
      .catch(err => console.error('Could not retrieve service runtime entities', err));
  }


  render() {
    const { runtimeObjects, file } = this.state;
    const { token } = this.props;
    return (
      <div>
        Hello Service Plugin
        
        {runtimeObjects.map((object, index) => (
          <div key={index}>
            <FilePreview file={file} />
          </div>
        ))}
      </div>
    )
  }
}

// export REDUX connected container
export default withFileClient(
  connect(ServiceContainer.mapStateToProps,ServiceContainer.mapDispatchToProps)(ServiceContainer),
)
