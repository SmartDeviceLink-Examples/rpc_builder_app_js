import React from 'react';

import { TableView, TableViewItem } from './TableView';
import TableViewHeader from './TableViewHeader';

import AppConfig from './menu/AppConfig'
import RpcConfig from './menu/RpcConfig'
import FavRpcs from './menu/FavRpcs'

export default class MenuBar extends React.Component {
    constructor(props) {
        super(props);

        this.setTableViewActive = this.setTableViewActive.bind(this);
        this.onConnect = this.onConnect.bind(this);

        this.state = {
            tableView: null,
            rpcVersion: undefined,
            appConnected: false
        }
    }

    componentWillMount() {
        var remote = 'smartdevicelink';
        var branch = 'master';

        var that = this;
        fetch(`https://raw.githubusercontent.com/${remote}/rpc_spec/${branch}/MOBILE_API.xml`).then((res) => res.text()).then((xml) => {
            var xml2json = function(node) {
                if (node.nodeName === 'struct' || (node.nodeName === 'function' && node.attributes && node.attributes.messagetype 
                     && node.attributes.messagetype.nodeValue === 'request')) {
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

            console.log(`api spec ${remote}/${branch} has been loaded`);
        });
    }

    setTableViewActive(tableViewItem, itemId) {
        console.log(`setTableViewActive(${tableViewItem}, ${itemId})`);
        this.setState({ tableView: itemId });
    }

    onConnect() {
        this.setTableViewActive('mb-table', null);
        console.log('on-connect');
        this.setState({ appConnected: true });
    }

    render() {
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
                        <AppConfig onConnect={this.onConnect} rpcVersion={this.state.rpcVersion} />
                    </TableViewItem>
                    <TableViewItem
                        onClick={this.setTableViewActive}
                        tableId="mb-table"
                        id="rpcconfig"
                        key="rpcconfig"
                        label="Configure RPC"
                        className="ph3"
                    >
                        <RpcConfig appServiceName="mediaServiceData"/>
                    </TableViewItem>
                    <TableViewItem
                        onClick={this.setTableViewActive}
                        tableId="mb-table"
                        id="favrpcs"
                        key="favrpcs"
                        label="Favorite RPCs"
                        className="ph3"
                    >
                        <FavRpcs appServiceName="mediaServiceData"/>
                    </TableViewItem>
                    <TableViewHeader key="recent-header" label="Recently Used RPCs"/>
                </TableView>
            </div>);
    }
}