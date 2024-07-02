import { LocalURLProvider } from "@regardsoss/display-control";
import { IFrameURLContentDisplayer } from "@regardsoss/components";
import { IFrameDisplayer } from "./IFrameDisplayer";

export class FilePreview extends React.Component {

    static propTypes = {
        file: PropTypes.shape({
            content: PropTypes.instanceOf(Blob).isRequired,
            contentType: PropTypes.string.isRequired,
        }),
    }

    render() {
        const { file } = this.props;
        const { content, contentType } = file
        console.log('fichier:', file, ' contenu:', content, ' typedecontenu', contentType);
        return (
            <LocalURLProvider blob={content} targetPropertyName="source">
                <IFrameDisplayer />
            </LocalURLProvider>
        )
    }
}

export default FilePreview