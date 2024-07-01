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
  static mapStateToProps(state) {
    const token = AuthenticationClient.authenticationSelectors.getAccessToken(state)
    return {
      token: token
    }
  }

  /**
   * Redux: map dispatch to props function
   * @param {*} dispatch: redux dispatch function
   * @param {*} props: (optional)  current component properties (excepted those from mapStateToProps and mapDispatchToProps)
   * @return {*} list of component properties extracted from redux state
   */
  static mapDispatchToProps(dispatch, { target }) {
    return {
      // we apply partially the method getReducePromise to ignore dispatch reference at runtime
      getReducePromise: (reducer, initialValue) => TargetEntitiesResolver.getReducePromise(dispatch, target, reducer, initialValue),
    }
  }

  static propTypes = {
    pluginInstanceId: PropTypes.string.isRequired,
    target: AccessShapes.PluginTarget.isRequired,
    configuration: AccessShapes.RuntimeConfiguration.isRequired,
    // From mapDispatchToProps
    getReducePromise: PropTypes.func.isRequired, // partially applied reduce promise, see mapStateToProps and later code demo
    // From mapStateToProps
    token: PropTypes.string,
  }

  state = {
    runtimeObjects: [],
  }

  componentDidMount() {
    // Start fetching and converting entities: append each new entity in array
    // Note: It isn't a good pratice to keep complete entities in memory as it result
    // in heavy memory load (just demonstrated here).
    const { getReducePromise } = this.props

    getReducePromise((previouslyRetrieved, entity) => [...previouslyRetrieved, entity], [])
      .then(runtimeObjects => this.setState({ runtimeObjects }))
      .catch(err => console.error('Could not retrieve service runtime entities', err))
  }


  render() {
    const { runtimeObjects } = this.state
    const { token } = this.props
    return (
      <div>
        Hello Service Plugin
        
        {runtimeObjects.map((object, index) => (
          <div key={index}>
            <p>Session Owner: {object.content.sessionOwner}</p>
            <p>Provider ID: {object.content.providerId}</p>
            <p>Model: {object.content.model}</p>
            <h2>Services:</h2>
            {object.content.services.map((service, serviceIndex) => (
              <p key={serviceIndex}>Service Label: {service.content.label}</p>
            ))}
            <img
              src={`http://10.31.37.11:80/api/v1/rs-catalog/downloads/${object.content.virtualId}/files/8c6b56e6d621b9192f2f162f0f9ac43c?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWdhcmRzbmljb25ld0BnbWFpbC5jb20iLCJhdWQiOlsicnMtYXV0aGVudGljYXRpb24iXSwicm9sZSI6IklOU1RBTkNFX0FETUlOIiwidXNlcl9uYW1lIjoiZnIuY25lcy5yZWdhcmRzLmZyYW1ld29yay5zZWN1cml0eS51dGlscy5qd3QuVXNlckRldGFpbHNANTJkYjQyNzkiLCJzY29wZSI6WyJyZWdhcmRzbmljb25ldyJdLCJleHAiOjE3MjIwODQyMDYsImF1dGhvcml0aWVzIjpbIklOU1RBTkNFX0FETUlOIl0sImp0aSI6IjlYWWNuQzJjOFlPMkdpVEZIY0JSbGZoLWc0YyIsInRlbmFudCI6InJlZ2FyZHNuaWNvbmV3IiwiZW1haWwiOiJyZWdhcmRzbmljb25ld0BnbWFpbC5jb20iLCJjbGllbnRfaWQiOiJjbGllbnQifQ.8HvN1ojPNvCoSAzr4w8caSrMQ82f7edCEQ0KF9ktWB4`}
            />
            <p>Token: {token}</p>
            {Object.values(object.content.files).flat().map((file, index) => (
              <div key={index}>
                <h2>File {index + 1}</h2>
                <p>URI: {file.uri}</p>
                <p>MIME Type: {file.mimeType}</p>
              </div>
            ))}
            <iframe src='https://cdn.jsdelivr.net/gh/DreynN/pluginsUIRegards@master/nicotest/target/prod/plugin.js'></iframe>
            {/* <URIContentDisplayer uri='http://10.31.37.11:80/api/v1/rs-catalog/downloads/URN:AIP:DATA:regardsniconew:21da591f-1bf7-3290-8d16-5541d1441377:V1/files/cc26a2a2d48331790247a7f6eadeb0b5' /> */}
            {/* <LocalURLProvider blob='http://10.31.37.11:80/api/v1/rs-catalog/downloads/URN:AIP:DATA:regardsniconew:a90e9f6b-d7aa-3e61-91ea-d04a49f9394c:V1/files/cff687b80b4d325a5c47a939d2641088?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWdhcmRzbmljb25ld0BnbWFpbC5jb20iLCJhdWQiOlsicnMtYXV0aGVudGljYXRpb24iXSwicm9sZSI6IklOU1RBTkNFX0FETUlOIiwidXNlcl9uYW1lIjoiZnIuY25lcy5yZWdhcmRzLmZyYW1ld29yay5zZWN1cml0eS51dGlscy5qd3QuVXNlckRldGFpbHNAN2QzYjM3NTYiLCJzY29wZSI6WyJyZWdhcmRzbmljb25ldyJdLCJleHAiOjE3MjAzNDAyOTAsImF1dGhvcml0aWVzIjpbIklOU1RBTkNFX0FETUlOIl0sImp0aSI6InFWZWUwRWJzU1lwMUZOa3RXYl9rbG93WkJmQSIsInRlbmFudCI6InJlZ2FyZHNuaWNvbmV3IiwiZW1haWwiOiJyZWdhcmRzbmljb25ld0BnbWFpbC5jb20iLCJjbGllbnRfaWQiOiJjbGllbnQifQ.fD5q686C04JenAgRp1cI1BxpHwLHSG7Y-KFFysUw04I' targetPropertyName="source">
              <IFrameURLContentDisplayer />
            </LocalURLProvider> */}
            {/* <div>uri du fichier: {`${object.content.files.RAWDATA[1].uri}?token=${token}`}
              <URIContentDisplayer uri={`${object.content.files.RAWDATA[1].uri}?token=${token}`} />
            </div> */}
          </div>
        ))}
      </div>
    )
  }
}

// export REDUX connected container
export default connect(
  ServiceContainer.mapStateToProps,
  ServiceContainer.mapDispatchToProps)(ServiceContainer)
