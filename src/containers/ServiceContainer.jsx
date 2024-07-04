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
import FilePreview from '../components/FilePreview'

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
    const token = AuthenticationClient.authenticationSelectors.getAccessToken(state);
    return {
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
    const { target } = props;
    return {
      // we apply partially the method getReducePromise to ignore dispatch reference at runtime
      getReducePromise: (reducer, initialValue) => TargetEntitiesResolver.getReducePromise(dispatch, target, reducer, initialValue),
    }
  }

  static propTypes = {
    // From runtime
    pluginInstanceId: PropTypes.string.isRequired,
    target: AccessShapes.PluginTarget.isRequired,
    configuration: AccessShapes.RuntimeConfiguration.isRequired,
    // From mapDispatchToProps
    getReducePromise: PropTypes.func.isRequired, // partially applied reduce promise, see mapStateToProps and later code demo
    // From mapStateToProps
    token: PropTypes.string.isRequired,

  }

  state = {
    reqObject: null,
    reqObjectLoading: true,
    checksumfilenames: [],
    aipID: null,
  }

  buildChecksumFilenamesArray(rawDataFiles) {
    let chsumflnames = [];
    rawDataFiles.forEach(({ checksum, filename }) => {
      chsumflnames.push({ checksum, filename });
    });
    return chsumflnames;
  }

  componentDidMount() {
    const { getReducePromise } = this.props;
    getReducePromise((previouslyRetrieved, entity) => [...previouslyRetrieved, entity], [])
      .then(runtimeObjects => {
        let chsumflnames = this.buildChecksumFilenamesArray(runtimeObjects[0].content.files.RAWDATA);
        let idaip = runtimeObjects[0].content.virtualId;
        this.setState({ checksumfilenames: chsumflnames, aipID: idaip });
      })
      .catch(err => console.error('Could not retrieve service runtime entities', err));
  }

  buildReqObject(filechecksum) {
    const { aipID } = this.state;
    const { token } = this.props;
    let reqParamsObject = {
      AIP_ID: aipID,
      checksum: filechecksum,
      token: token
    };
    this.setState({ reqObject: reqParamsObject, reqObjectLoading: false });
  }

  render() {
    const { reqObject, reqObjectLoading, checksumfilenames } = this.state;

    if (!reqObjectLoading) {
      return (
        <div>
          <button onClick={() => this.setState({ reqObjectLoading: true })}>RETOUR</button>
          <FilePreview filePathParams={reqObject} />
        </div>
      )
    }
    return (
      <div>
        <div>Liste des fichiers :</div>
        <ul>
          {checksumfilenames.map((object, index) => (
            <li
              key={index}
              value={object.checksum}
              onClick={() => this.buildReqObject(object.checksum)}
            >
              {object.filename}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

// export REDUX connected container
export default
  connect(ServiceContainer.mapStateToProps, ServiceContainer.mapDispatchToProps)(ServiceContainer)

