import React from 'react';

export default class FavRpcOption extends React.Component {
    render() {
        return (<div
            className={`w-100 ph3 dark-grey pv1 fw5 bb b--grey--light flex items-center bg-white hover-bg-ice cursor-pointer`}
            role="menuitem"
            aria-haspopup="true"
        >
            <p style={{ flexGrow: 8 }} onClick={this.props.loadSaved}>{this.props.rpc.name}</p>
            <div style={{ width: 16, height: 16 }} onClick={this.props.deleteSavedRpc}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path style={{ fill: '#da4453', fillOpacity: 1, stroke: 'none' }} 
                    d="M 6 2 L 6 3 L 2 3 L 2 4 L 3 4 L 3 14 L 4 14 L 13 14 L 13 13 L 13 4 L 14 4 L 14 3 L 10 3 L 10 2 L 6 2 z M 7 3 L 9 3 L 9 4 L 10 4 L 12 4 L 12 13 L 4 13 L 4 4 L 7 4 L 7 3 z M 6 6 L 6 11 L 7 11 L 7 6 L 6 6 z M 9 6 L 9 11 L 10 11 L 10 6 L 9 6 z " />
                </svg>
            </div>
            <div style={{ marginLeft: '5%' }} onClick={this.props.loadSaved} className="arrow arrow--right" />
        </div>)
    }
}