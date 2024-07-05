import { getFileClient } from "../clients/FileClient";

export default (Component) => class WithClient extends React.Component {

    render() {
        const { pluginInstanceId } = this.props;
        const FileClient = getFileClient(pluginInstanceId);
        return (
            <Component {...this.props} FileClient={FileClient} />
        );
    }
}