// Libs
import React from 'react';

export default class AppHeader extends React.Component {
    render() {
        return (
            <div className="manticore__header w-100 h4 bg-black shrink-0 items-center justify-center relative flex flex-row">
                <span className="fw5 ml1 f3 white tc">{this.props.headerText}</span>
                <svg className="db" id="status-indicator" width="21" height="21" viewBox="0 0 14 14" style={{ paddingLeft: 10 }}>
                    <circle stroke="black" strokeWidth="1" cx="7" cy="7" r="4" fill={this.props.headerStatusColor}/>
                </svg>
            </div>
        );
    }
}
