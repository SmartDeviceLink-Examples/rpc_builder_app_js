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
        this.getParamValue = this.getParamValue.bind(this);

        var saved = props.savedRpc;
        console.log('rpcConfig.js prop', saved);
        var rpcName = saved ? saved.rpc ? saved.rpc : saved.name : 'Alert';

        var rpc = document.apiSpec.functions[rpcName];

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
                included: saved ? saved.parameters[param.name] ? true : false : param.mandatory === 'true',
                value: saved ? saved.parameters[param.name] : undefined
            }
        }

        console.log('rpcConfig.js state', params)

        this.state = {
            selectedRpcName: rpcName,
            savedRpcName: undefined,
            saveRpc: false,
            parameters: params
        }
    }

    sendRpc() {
        var value = {};
        var bulkData = null;
        this.props.addRecentRpc(this.state.selectedRpcName, this.state.parameters);
        for (var param in this.state.parameters) {
            var pObj = this.state.parameters[param];
            if (param === 'bulkData' && pObj.included) { bulkData = pObj.value }
            else if (pObj.included) { value[param] = pObj.value }
        }
        console.log('sendRPC: ', this.state.selectedRpcName, value, bulkData);

        const rpc = new document.SDL.rpc.messages[this.state.selectedRpcName]({ parameters: value });
        if (bulkData) {
            rpc.setBulkData(bulkData);
        }
        document.sdlManager.sendRpc(rpc);

        if (this.state.saveRpc) {
            var pendingSavedRpc = {
                rpc: this.state.selectedRpcName,
                name: this.state.savedRpcName,
                parameters: value
            }

            var savedRpcs = localStorage.getItem('savedRpcs');
            if (!savedRpcs) {
                localStorage.setItem('savedRpcs', JSON.stringify([ pendingSavedRpc ], null, 4));
            } else {
                var json = JSON.parse(savedRpcs);
                for (var _rpc of json) {
                    if (_rpc.name === pendingSavedRpc.name) {
                        alert('you already have a saved rpc with the same name');
                        return;
                    }
                }
                json.push(pendingSavedRpc);
                var jsonStr = JSON.stringify(json, null, 4);
                localStorage.setItem('savedRpcs', jsonStr);
            }
        }

        this.props.resetSaved();
        
        if (this.state.saveRpc) {
            this.props.move('mb-table', 'favrpcs');
        } else {
            this.props.move('mb-table', null);
        }
    }

    setSavedRpcName(name) {
        this.setState({ savedRpcName: name });
    }

    rpcSelected(rpcObj) {
        var name = rpcObj.value;
        var rpc = document.apiSpec.functions[name];
        this.props.resetSaved();

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
        console.log('setParamValue', paramName, value, params);
        params[paramName].value = value;
        this.setState({ parameters: params });
    }

    getParamValue(paramName) {
        var params = this.state.parameters;
        return params[paramName].value;
    }

    genParams(rpcName) {
        if (!document.apiSpec.functions[rpcName]) {
            return [];
        }

        console.log('gen params,', this.state.parameters)

        return document.apiSpec.functions[rpcName].map(param => api2html(this, param, this.getParamValue(param.name)));
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