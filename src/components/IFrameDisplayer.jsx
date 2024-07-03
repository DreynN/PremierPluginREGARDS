
export class IFrameDisplayer extends React.Component {

  static propTypes = {
    source: PropTypes.string,
  }

  render() {
    const {
      source,
    } = this.props

    return (
      <div style={{ height: '100vh' }}>
        <iframe
          style={{
            background: '#FFFFFF',
            height: '100%',
            width: '100%',
          }}
          title="content-displayer"
          src={source}
        />
      </div>
    )
  }
}

export default IFrameDisplayer
