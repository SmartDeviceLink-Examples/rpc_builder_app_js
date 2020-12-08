import React from 'react';

export default class Logs extends React.Component {
    constructor(props) {
        super(props);

        this.clearOutput = this.clearOutput.bind(this);
        this.filterKeyDown = this.filterKeyDown.bind(this);

        this.state = {
            logs: [],
            filterValue: undefined,
            pendingFilterValue: undefined
        }
    }

    filterKeyDown(e) {
        if (e.key === 'Enter') {
            this.state.filterValue = this.state.pendingFilterValue;
        }
    }

    clearOutput() {
        this.state.logs = [];
    }

    render() {
        return (<div className="flex-row">
            <div className="flex-column">
                <p class="logHeaderTitle">OUTPUT</p>
                <input type="text" class="logFilterOutput" placeholder="filter output" onKeyDown={this.filterKeyDown} value={this.state.filterValue}/>
                <input type="button" class="logClearOutput">Clear Logs</input>
            </div>
            <div className="flex-column">
                
            </div>
        </div>)
    }
}