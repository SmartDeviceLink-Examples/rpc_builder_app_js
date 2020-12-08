// Libs
import React from 'react';
import PropTypes from 'prop-types';

export default class AppHeader extends React.Component {
    static propTypes = {
        errorText: PropTypes.string,
        connected: PropTypes.bool,
        hmiStatus: PropTypes.string
    };

    render() {
        let title;

        if (this.props.errorText) {
            title = <span className="fw5 ml1 f3 white w-100 tc">{this.props.errorText}</span>;
        } else if (!this.props.connected) {
            title = <span className="fw5 ml1 f3 white w-100 tc">Connecting...</span>;
        } else {
            title = (
                <div className="manticore__logo w-100 h-100 flex justify-center items-center white">
                    <svg className="db" id="status-indicator" width="14" height="14" viewBox="0 0 14 14">
                        <circle stroke="black" strokeWidth="1" cx="7" cy="7" r="4">
                            <animate className="animation-in" begin="indefinite" dur="200ms" attributeName="r" to="6" fill="freeze" />
                            <animate className="animation-out" begin="indefinite" dur="200ms" attributeName="r" to="4" fill="freeze" />
                        </circle>
                    </svg>
                    <span className="fw5 ml1 f3">rpc builder js</span>
                    <span className="f5 ml2">v 1.0.0</span>
                </div>
            );
        }

        return (
            <div className="manticore__header w-100 h4 bg-black shrink-0 items-center justify-between relative flex">
                {title}
            </div>
        );
    }
}
