import { LocalURLProvider } from "@regardsoss/display-control";
import { connect } from '@regardsoss/redux'
import { BasicSignalSelectors } from '@regardsoss/store-utils'
import { IFrameDisplayer } from "./IFrameDisplayer";
import { DownloadFileClient } from "../clientsfiles/main";
import withFileClient from "../containers/withFileClient";
export class FilePreview extends React.Component {

    static mapDispatchToProps(dispatch, props) {
        const { FileClient } = props;
        return {
            fetchFile: (searchContext) => dispatch(FileClient.actions.getDownloadFile(searchContext)),
        }
    }

    static propTypes = {
        // From ServiceContainer.jsx
        filePathParams: PropTypes.object,
        // From withFileClient()
        FileClient: PropTypes.shape({
            actions: PropTypes.instanceOf(DownloadFileClient.SearchDownloadFileActions),
            selectors: PropTypes.instanceOf(BasicSignalSelectors),
        }).isRequired,
        // From mapDispatchToProps
        fetchFile: PropTypes.func.isRequired,
    }

    state = {
        file: null,
        fileLoading: true,
    }

    componentDidMount() {
        const { filePathParams, fetchFile } = this.props;
        this.setState({ file: null, fileLoading: true })
        fetchFile(filePathParams).then((results) => {
            this.setState({ file: results.payload, fileLoading: false });
            console.log('fichier: ', results.payload);
        })
        .catch(err => console.error('Could not retrieve get file', err));
    }

    render() {
        const { fileLoading } = this.state;
        if (!fileLoading) {
            const { file } = this.state;
            const { content } = file;
            return (
                <LocalURLProvider blob={content} targetPropertyName="source">
                    <IFrameDisplayer />
                </LocalURLProvider>
            )
        }
        return (
            <div>fichier en attente de chargement</div>
        )
    }
}

// export REDUX connected container
export default withFileClient(
    connect(null, FilePreview.mapDispatchToProps)(FilePreview),
)