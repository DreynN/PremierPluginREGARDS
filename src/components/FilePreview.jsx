import { connect } from '@regardsoss/redux'
import { BasicSignalSelectors } from '@regardsoss/store-utils'
import { themeContextType } from '@regardsoss/theme';
import { LocalURLProvider } from '@regardsoss/display-control';
import { DownloadFileClient } from "../clientsfiles/main";
import { IFrameDisplayer } from "./IFrameDisplayer.jsx"
import withFileClient from "../containers/withFileClient";
import Papa from '../modules/papaparse.min.js';
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
        filename: PropTypes.string,
        // From withFileClient()
        FileClient: PropTypes.shape({
            actions: PropTypes.instanceOf(DownloadFileClient.SearchDownloadFileActions),
            selectors: PropTypes.instanceOf(BasicSignalSelectors),
        }).isRequired,
        // From mapDispatchToProps
        fetchFile: PropTypes.func.isRequired,
    }

    static contextTypes = {
        // enable plugin theme access through this.context
        ...themeContextType,
    }

    state = {
        file: null,
        fileLoading: true,

        isCSV: false,

        tableRows: [],
        values: [],
        parseLoading: true,
    }

    componentDidMount() {
        const { filename, filePathParams, fetchFile } = this.props;
        this.setState({ file: null, fileLoading: true })
        fetchFile(filePathParams).then((results) => {
            this.setState({ file: results.payload, fileLoading: false });
            this.isFileCsv(filename);
            console.log('fichier: ', results.payload);
        })
            .catch(err => console.error('Could not retrieve get file', err));
        
    }

    //TODO a placer
    isFileCsv(filename) {
        if (filename.includes(".csv")) {
            // File name contains ".csv"
            this.setState({ isCSV: true });
            this.parseCSV();
        } else {
            // File name does not contain ".csv"
            this.setState({ isCSV: false });
        }
    }

    parseCSV() {
        const { file } = this.state;
        const { content } = file
        Papa.parse(content, {
            complete: (results) => {
                console.log("Finished:", results.data);
                const rowsArray = [];
                const valuesArray = [];

                // Iterating data to get column name and their values
                results.data.map((d) => {
                    rowsArray.push(Object.keys(d));
                    valuesArray.push(Object.values(d));
                });

                this.setState({
                    tableRows: rowsArray[0],
                    values: valuesArray,
                    parseLoading: false,
                });

            }
        });
    }

    render() {
        const { moduleTheme } = this.context;
        const { fileLoading, parseLoading, tableRows, values, isCSV } = this.state;
        if (!fileLoading) {
            const { file } = this.state;
            const { content } = file;
            if (!isCSV) {
                return (
                    <LocalURLProvider blob={content} targetPropertyName="source">
                        <IFrameDisplayer />
                    </LocalURLProvider>
                )
            }
            if (isCSV) {
                if (!parseLoading) {
                    return (
                        <table style={moduleTheme.table}>
                            <thead>
                                <tr>
                                    {tableRows.map((rows, index) => {
                                        return <th key={index} style={moduleTheme.th}>{rows}</th>;
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {values.map((value, index) => {
                                    return (
                                        <tr key={index}>
                                            {value.map((val, i) => {
                                                return <td key={i} style={moduleTheme.td}>{val}</td>;
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )
                }
                return (
                    <div>Chargement du fichier CSV</div>
                )
            }
            return (
                <div>Verification du type de fichier, CSV ou non</div>
            )
        }
        return (
            <div>Fichier en attente de chargement</div>
        )
    }
}

// export REDUX connected container
export default withFileClient(
    connect(null, FilePreview.mapDispatchToProps)(FilePreview),
)