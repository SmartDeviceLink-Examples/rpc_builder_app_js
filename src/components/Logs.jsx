import React from 'react';
import PropTypes from 'prop-types'
import LogScroll from './LogScroll';

class Log extends React.PureComponent {
    static propTypes = {
        id: PropTypes.number,
        log: PropTypes.string,
        name: PropTypes.string,
        primaryColor: PropTypes.string,
        secondaryColor: PropTypes.string
    }

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        }
    }

    render() {
        var noMargin = {
            margin: 0,
            padding: 0,
            'overflowY': 'hidden',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%'
        };

        var actualLog = this.state.collapsed ? null
            : (<span style={{ color: this.props.secondaryColor, fontFamily: 'monospace' }}> {this.props.log} </span>);

        return (
            <pre className={'code ice ws-prewrap word-break-all'} style={noMargin} key={this.props.id}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <span style={{ color: this.props.primaryColor }} onClick={() => { this.setState({ collapsed: !this.state.collapsed }); }}> {this.props.name} {"<"}</span>
                </div>
                { actualLog }
            </pre>
        );
    }
}

export default class Logs extends React.PureComponent {
    static propTypes = {
        logs: PropTypes.array,
        logFilterString: PropTypes.string,
        className: PropTypes.string
    }

    constructor(props) {
        super(props);

        this.clearLogs = this.clearLogs.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);

        this.state = {
            logs: [],
            logFilterString: ""
        }
    }

    clearLogs() {
        this.setState({ logs: [] });
    }

    componentWillMount() {
        var that = this;
        document.logRpc = function(rpc) {
            var namePrefix = '';
            var primaryColor = '#ffffff';
            var secondaryColor = '#ffffff';
            if (rpc._messageType === 0 && rpc._correlationID) {
                namePrefix = `[IN ${rpc._correlationID}] `;
            } else if (rpc._messageType === 1) {
                namePrefix = `[re: ${rpc._correlationID}] `;
                var res = rpc._parameters.resultCode;
                if (res === 'SUCCESS') {
                    primaryColor = '#78C96F';
                } else if (res === 'WARNINGS' || res === 'UNSUPPORTED_RESOURCE') {
                    primaryColor = '#F5A623';
                } else {
                    primaryColor = secondaryColor = '#F08289';
                }
            }

            var logs = that.state.logs;
            var log = { 
                id: logs.length,
                name: `${namePrefix}${rpc._functionName}`,
                log: JSON.stringify(rpc._parameters),
                primaryColor: primaryColor,
                secondaryColor: secondaryColor
            }

            logs.push(log);
            that.setState({
                logs: logs
            });
        }
    }

    shouldComponentUpdate() {
        return true;
    }

    render() {
        const filterOpts = this.state.logFilterString.split('+');
        const multiFilter = log => {
            let isAllowed = false;
            filterOpts.forEach(filterText => {
                isAllowed = isAllowed || log.log.toLowerCase().includes(filterText.toLowerCase());
            });
            return isAllowed;
        }
        const filteredLogs = this.state.logs.filter(multiFilter);

        return (
            <LogScroll maxViewableItems={100} scrollSensitivity={20}>
                {filteredLogs.map(log => 
                    (<Log id={log.id} log={log.log} name={log.name} primaryColor={log.primaryColor} secondaryColor={log.secondaryColor} />)
                )}
            </LogScroll>
        );
    }
}
