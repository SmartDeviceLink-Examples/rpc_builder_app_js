import React from 'react';
import Select from '../Select';
import ToggleSwitch from '../ToggleSwitch'

import { api2html } from './Parameters'

export default class RpcConfig extends React.Component {
    constructor(props) {
        super(props);

        this.sendRpc = this.sendRpc.bind(this);
        this.setSavedRpcName = this.setSavedRpcName.bind(this);
        this.rpcSelected = this.rpcSelected.bind(this);
        this.toggleSaveRpc = this.toggleSaveRpc.bind(this);
        this.genParams = this.genParams.bind(this);
        this.setIncluded = this.setIncluded.bind(this);
        this.setParamValue = this.setParamValue.bind(this);

        var rpc = document.apiSpec.functions.Alert;

        rpc.sort((a, b) => { 
            if (a.mandatory === 'true' && b.mandatory === 'false') {
                return -1;
            } else if (b.mandatory === 'true' && a.mandatory === 'false') {
                return 1;
            }

            return 0;
        });

        var params = {};
        for (var param of rpc) {
            params[param.name] = {
                mandatory: param.mandatory === 'true',
                included: param.mandatory === 'true',
                value: undefined
            }
        }

        this.state = {
            selectedRpcName: 'Alert',
            savedRpcName: undefined,
            saveRpc: false,
            parameters: params
        }
    }

    sendRpc() {
        console.log('sendRPC: ', this.state.selectedRpcName);
        var value = {};
        var bulkData = null;
        for (var param in this.state.parameters) {
            var pObj = this.state.parameters[param];
            if (param === 'bulkData' && pObj.included) { bulkData = pObj.value }
            else if (pObj.included) { value[param] = pObj.value }
        }
        console.log('params: ', value, bulkData);

        const rpc = new document.SDL.rpc.messages[this.rpcName]({ parameters: value });
        if (bulkData) {
            rpc.setBulkData(bulkData);
        }
        document.sdlManager.sendRpc(rpc);
    }

    setSavedRpcName(name) {
        this.setState({ savedRpcName: name });
    }

    rpcSelected(rpcObj) {
        var name = rpcObj.value;
        var rpc = document.apiSpec.functions[name];

        if (!rpc) {
            this.setState({ selectedRpcName: name });
            return;
        }

        rpc.sort((a, b) => { 
            if (a.mandatory === 'true' && b.mandatory === 'false') {
                return -1;
            } else if (b.mandatory === 'true' && a.mandatory === 'false') {
                return 1;
            }

            return 0;
        });

        var params = {};
        for (var param of rpc) {
            params[param.name] = {
                mandatory: param.mandatory === 'true',
                included: param.mandatory === 'true',
                value: undefined
            }
        }

        this.setState({ selectedRpcName: name, parameters: params });
    }

    toggleSaveRpc(value) {
        if (value !== this.state.saveRpc) {
            this.setState({ saveRpc: value });
        }
    }

    setIncluded(paramName, included) {
        var params = this.state.parameters;
        params[paramName].included = included;
        this.setState({ parameters: params });
    }

    setParamValue(paramName, value) {
        var params = this.state.parameters;
        console.log('setParamValue params', params);
        params[paramName].value = value;
        this.setState({ parameters: params });
    }

    genParams(rpcName) {
        if (!document.apiSpec.functions[rpcName]) {
            return [];
        }

        return document.apiSpec.functions[rpcName].map(param => api2html(this, param));
    }

    render() {
        let selectContent = [ <span key="select" className="mt2 fw5 ph2">Select RPC</span>,
                <Select onSelect={this.rpcSelected} selected={this.state.selectedRpcName}
                    options={Object.keys(document.apiSpec.functions).sort().map(f => {
                        return { value: f };
                    })} className=" ph2"/> ];

        let paramContent = (<div className="ph2"> { this.genParams(this.state.selectedRpcName) } </div>);

        let saveContent = (<div className="ph2" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'left', marginTop: '1em' }}>
                <span style={{ marginRight: 'auto' }}>Save RPC</span>
                <ToggleSwitch
                    value={this.state.saveRpc}
                    onChange={this.toggleSaveRpc}
                    true= "save"
                    false= "nah"
                    className= "">
                </ToggleSwitch>
            </div>);

        var saveContent2 = this.state.saveRpc ?
            (<input className="mt1 ph2 br2 ba ph2 dark-grey b--grey--light"
                value={this.state.savedRpcName}
                placeholder="saved rpc name"
                onChange={event => this.setSavedRpcName(event.target.value)}
                style={{width: "90%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
            />)
            : null;

        return (<div className="mt2">
                { selectContent }
                <div className="bb mv2" />
                { paramContent }
                <div className="bb mv2" />
                { saveContent }
                { saveContent2 }
                <div className="ph2">
                    <button onClick= { event => this.sendRpc() }
                        className="bn br2 outline-0 w-100 black bg-grey--dark cursor-pointer active-bg-manticore-blue active-white mt2"
                        style={{ paddingTop: "5px", paddingBottom: "5px" }}>
                            Send
                    </button>
                </div>
            </div>);
    }
}