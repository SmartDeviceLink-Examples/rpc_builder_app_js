import React from 'react';
import './App.css';

import AppHeader from './components/AppHeader'

import Pane from './components/Pane'
import Logs from './components/Logs'

import MenuBar from './components/MenuBar'

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.clearLogs = this.clearLogs.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);

    this.state = {
      logRef: React.createRef(),
      logFilterString: undefined
    }
  }

  clearLogs() {
    this.state.logRef.clearLogs();
  }

  onFilterChange(event) {
    this.setState({ logFilterString: event.target.value });
  }

  render() {
    return (
      <div className="App">
        <AppHeader/>
        <div className="flex-sidebyside">
          <Pane
            clearLogs={ this.clearLogs }
            onFilterChange = { this.onFilterChange }
            logFilterString = { this.state.logFilterString }
            title="Output"
            className="logPane mainPane bg-near-white">
              <Logs ref={this.state.logRef} logFilterString={this.state.logFilterString}/>
          </Pane>
          <Pane className="mainPane menuPane">
            <MenuBar connected hmiStatus='FULL'/>
          </Pane>
        </div>
      </div>
    );
  }
}
