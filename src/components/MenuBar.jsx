import React from 'react';

import { TableView, TableViewItem } from './TableView';
import TableViewHeader from './TableViewHeader';

import AppConfig from './menu/AppConfig'
import RpcConfig from './menu/RpcConfig'
import FavRpcs from './menu/FavRpcs'
import RecentRpcOption from './menu/RecentRpcOption'

export default class MenuBar extends React.Component {
    constructor(props) {
        super(props);

        this.setTableViewActive = this.setTableViewActive.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.loadSavedRpc = this.loadSavedRpc.bind(this);
        this.resetSavedRpc = this.resetSavedRpc.bind(this);
        this.addRecentRpc = this.addRecentRpc.bind(this);

        this.state = {
            tableView: null,
            rpcVersion: undefined,
            appConnected: false,
            savedRpc: undefined,
            recentRpcs: []
        }
    }

    componentWillMount() {
        var remote = 'smartdevicelink';
        var branch = 'develop';

        const mobileSentNotifications = [ 'OnAppCapabilityUpdated', 'OnAppServiceData' ]
        var that = this;
        fetch(`https://raw.githubusercontent.com/${remote}/rpc_spec/${branch}/MOBILE_API.xml`).then((res) => res.text()).then((xml) => {
            var xml2json = function(node) {
                if (node.nodeName === 'struct' || (node.nodeName === 'function' && node.attributes && node.attributes.messagetype
                     && (node.attributes.messagetype.nodeValue === 'request' || mobileSentNotifications.includes(node.attributes.name.nodeValue)))) {
                        document.apiSpec[node.nodeName + 's'][node.attributes.name.nodeValue] =
                            [...node.childNodes].filter(x => x.tagName === 'param').map(child => {
                                var param = {};
                                for (var attrib of child.attributes) {
                                    param[attrib.nodeName] = attrib.nodeValue;
                                }
                                return param;
                            });
                } else if (node.nodeName === 'enum') {
                    document.apiSpec.enums[node.attributes.name.nodeValue] =
                        [...node.childNodes].filter(child => child.tagName === 'element').map(element => {
                            return element.attributes.name.nodeValue;
                        })
                } else {
                    if (node.nodeName === 'interface') {
                        that.setState({ rpcVersion: node.attributes.version.nodeValue.split('.') });
                    }
                    for (var child of node.childNodes) {
                        xml2json(child);
                    }
                }
            }

            document.apiSpec = {
                functions: {},
                enums: {},
                structs: {}
            }

            xml2json((new DOMParser()).parseFromString(xml, "text/xml"));

            // exception for param not in spec
            document.apiSpec.functions.PutFile.push({
                name: 'bulkData',
                mandatory: 'true'
            });
            document.apiSpec.functions.SystemRequest.push({
                name: 'bulkData',
                mandatory: 'false'
            });

            console.log(`api spec ${remote}/${branch} has been loaded`);
        });
    }

    resetSavedRpc() {
        this.setState({ savedRpc: undefined });
    }

    loadSavedRpc(rpc) {
        this.setState({ savedRpc: rpc });
        this.setTableViewActive('mb-table', 'rpcconfig');
    }

    addRecentRpc(name, parameters) {
        var recents = this.state.recentRpcs;
        recents.push({
            name: name,
            parameters: parameters
        });
        this.setState({
            recentRpcs: recents
        });
    }

    setTableViewActive(tableViewItem, itemId) {
        if (this.state.tableView === 'rpcconfig') {
            this.setState({ savedRpc: undefined });
        }

        this.setState({ tableView: itemId });
    }

    onConnect(appName) {
        this.setTableViewActive('mb-table', null);
        this.setState({ appConnected: true });
        this.props.setAppName(appName);
    }

    render() {
        var that = this;
        return (<div className="menu-bar flex flex-column flex-item overflow-hidden bg-silver">
                <TableView
                    id="mb-table"
                    register={()=>null}
                    className="flex flex-column bg-white menu-bar-table"
                    active={this.state.tableView}
                    onBack={this.setTableViewActive}
                >
                    <TableViewHeader key="send-header" label="Send RPC"/>
                    <TableViewItem
                        onClick={this.state.appConnected ? null :this.setTableViewActive}
                        tableId="mb-table"
                        id="appconfig"
                        key="appconfig"
                        label="Configure Application"
                        className="ph3"
                    >
                        <AppConfig onConnect={this.onConnect} rpcVersion={this.state.rpcVersion} setStatusColor={this.props.setStatusColor} />
                    </TableViewItem>
                    <TableViewItem
                        onClick={this.setTableViewActive}
                        tableId="mb-table"
                        id="rpcconfig"
                        key="rpcconfig"
                        label="Configure RPC"
                        className="ph3"
                    >
                        <RpcConfig appServiceName="mediaServiceData"
                            addRecentRpc={this.addRecentRpc} move={this.setTableViewActive}
                            savedRpc={this.state.savedRpc} resetSaved={this.resetSavedRpc}/>
                    </TableViewItem>
                    <TableViewItem
                        onClick={this.setTableViewActive}
                        tableId="mb-table"
                        id="favrpcs"
                        key="favrpcs"
                        label="Favorite RPCs"
                        className="ph3"
                    >
                        <FavRpcs appServiceName="mediaServiceData" loadSavedRpc={this.loadSavedRpc}/>
                    </TableViewItem>
                    <TableViewHeader key="recent-header" label="Recently Used RPCs"/>
                    <div className="fav_rpcs">
                    {
                        this.state.recentRpcs.map((rpc, i) => (
                            <RecentRpcOption key={i} rpc={rpc} handleClick={(rpc) => that.loadSavedRpc(rpc)} />
                        ))
                    }
                    </div>
                </TableView>
            </div>);
    }
}
