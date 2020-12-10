import React from 'react';

export default class RecentRpcOption extends React.Component {
    render() {
        return (<div
            className={`w-100 ph3 dark-grey pv1 fw5 bb b--grey--light flex items-center justify-between bg-white hover-bg-ice cursor-pointer`}
            onClick={() => this.props.handleClick(this.props.rpc)}
            role="menuitem"
            aria-haspopup="true"
        >
            {this.props.rpc.name}
            <div className="arrow arrow--right" />
        </div>)
    }
}