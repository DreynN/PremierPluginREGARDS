import { getFileClient } from "../clients/FileClient";

export default (Component) => class WithClient extends React.Component {
    static propTypes = {
        pluginInstanceId: PropTypes.string.isRequired,
    }

    render() {
        const { pluginInstanceId } = this.props
        const FileClient = getFileClient(pluginInstanceId)
        return (
            <Component {...this.props} FileClient={FileClient} />
        )
    }
}