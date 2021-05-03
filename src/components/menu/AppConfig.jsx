import React from 'react';

export default class AppConfig extends React.Component {
    constructor(props) {
        super(props);

        this.setAppId = this.setAppId.bind(this);
        this.setAppName = this.setAppName.bind(this);
        this.toggleHMIType = this.toggleHMIType.bind(this);
        this.setWsUrl = this.setWsUrl.bind(this);
        this.setWsPort = this.setWsPort.bind(this);
        this.setHashId = this.setHashId.bind(this);
        this.setPtuOverrideUrl = this.setPtuOverrideUrl.bind(this);
        this.connectApp = this.connectApp.bind(this);

        var prevStateStr = localStorage.getItem('lastAppState');

        if (null !== prevStateStr) {
            var prevState = JSON.parse(prevStateStr);
            if (prevState.appId) {
                this.state = prevState;
                return;
            }
        }

        this.state = {
            appId: 'rpcb-js',
            appName: 'RPC Builder',
            appHMITypes: [],
            wsUrl: 'ws://',
            wsPort: 2020,
            hashId: '',
            ptuUrlOverride: ''
        }
    }

    setAppId(id) {
        this.setState({ appId: id });
    }

    setAppName(name) {
        this.setState({ appName: name });
    }

    toggleHMIType(type) {
        var ary = this.state.appHMITypes;
        const index = ary.indexOf(type);
        if (index === -1) {
            ary.push(type);
        } else {
            ary.splice(index, 1);
        }
        this.setState({
            appHMITypes: ary
        });
    }

    setWsUrl(url) {
        this.setState({ wsUrl: url });
    }

    setWsPort(port) {
        this.setState({ wsPort: port });
    }

    setHashId(hash) {
        this.setState({ hashId: hash });
    }

    setPtuOverrideUrl(url) {
        this.setState({ ptuUrlOverride: url });
    }

    connectApp() {
        if (this.state.wsUrl === 'ws://') {
            alert('please fill in connection url');
            return;
        }

        const SDL = require('../../public/SDL.min.js');
        document.SDL = SDL;

        var hashId = this.state.hashId === '' ? null : this.state.hashId;

        const lifecycleConfig = new SDL.manager.LifecycleConfig()
            .setAppId(this.state.appId)
            .setAppName(this.state.appName)
            .setLanguageDesired(SDL.rpc.enums.Language.EN_US)
            .setAppTypes(this.state.appHMITypes)
            .setVrSynonyms([ this.state.appName ])
            .setResumeHash(hashId);

        lifecycleConfig.setTransportConfig(new SDL.transport.WebSocketClientConfig(this.state.wsUrl, this.state.wsPort));

        const filePath = './public/app_icon.png';
        const file = new SDL.manager.file.filetypes.SdlFile()
            .setName('AppIcon')
            .setFilePath(filePath)
            .setType(SDL.rpc.enums.FileType.GRAPHIC_PNG)
            .setPersistent(true);

        lifecycleConfig.setAppIcon(file);
        document.SDL.manager.lifecycle._LifecycleManager.MAX_RPC_VERSION.setMajor(this.props.rpcVersion[0]);
        document.SDL.manager.lifecycle._LifecycleManager.MAX_RPC_VERSION.setMinor(this.props.rpcVersion[1]);
        document.SDL.manager.lifecycle._LifecycleManager.MAX_RPC_VERSION.setPatch(this.props.rpcVersion[2]);

        const appConfig = new SDL.manager.AppConfig()
            .setLifecycleConfig(lifecycleConfig);

        const managerListener = new SDL.manager.SdlManagerListener()
            .setOnError((sdlManager, info) => {
                console.error('Error from SdlManagerListener: ', info);
            });

        document.sdlManager = new SDL.manager.SdlManager(appConfig, managerListener)
            .start()
            .addRpcListener(SDL.rpc.enums.FunctionID.OnHMIStatus, (onHmiStatus) => {
                var hmiStatusIndicator = document.querySelector('p#hmiStatus');
                if (hmiStatusIndicator) {
                    hmiStatusIndicator.innerHTML = `HMI Level: ${onHmiStatus.getHmiLevel()}`;
                }
            });

        // apply hooks in sdl js library

        // allow sending of RPCs that don't follow the spec
        // todo add warning confirm dialog if RPC doesn't conform to spec
        document.validateType = document.SDL.rpc.RpcStruct._validateType;
        document.SDL.rpc.RpcStruct._validateType = function() { return true; }

        // log outgoing RPCs
        const sendFunc = document.sdlManager._lifecycleManager.sendRpcMessage;
        document.sdlManager._lifecycleManager.sendRpcMessage = async (message) => {
            if (!message) { return; }
            if (document.logRpc) { document.logRpc(message); }
            return sendFunc.call(document.sdlManager._lifecycleManager, message);
        };

        // log incoming RPCs
        const recvFunc = document.sdlManager._lifecycleManager._handleRpc;
        document.sdlManager._lifecycleManager._handleRpc = async (message) => {
            if (!message) { return; }
            if (document.logRpc) { document.logRpc(message); }
            if (message._messageType === 0 && message._functionName === 'GetAppServiceData') {
                setTimeout(() => { // incoming app service data subscription request, ask user how to reply
                    var response = new document.SDL.rpc.messages.GetAppServiceDataResponse();
                    response.setCorrelationId(message._correlationID);
                    var allow = window.confirm(`request to subscribe to ${message.getParameter('serviceType')} app service data, allow or deny?`);
                    response.setSuccess(allow);
                    response.setResultCode(allow ? "SUCCESS" : "REJECTED");
                    document.sdlManager._lifecycleManager.sendRpcMessage(response);
                }, 5);
            } else if (message._functionName === 'OnHashChange') {
                var prevStateStr = localStorage.getItem('lastAppState');
        
                if (null !== prevStateStr) {
                    var prevState = JSON.parse(prevStateStr);
                    prevState.hashId = message._parameters.hashID;
                    localStorage.setItem('lastAppState', JSON.stringify(prevState));
                }
            } else if (message._functionName === 'OnSystemRequest') {
                if (message._parameters?.url) {
                    if (message._parameters.requestType === document.SDL.rpc.enums.RequestType.PROPRIETARY
                    && 'JSON' === message._parameters.fileType) {
                        setTimeout(() => {
                            let utf8decoder = new TextDecoder();
                            var bulkDataJson = JSON.parse(utf8decoder.decode(message._bulkData));
                            var httpHeaders = bulkDataJson['HTTPRequest']['headers'];
                            var httpBody = bulkDataJson['HTTPRequest']['body'].toString();

                            var _headers = {};
                            if (httpHeaders.ContentType) {
                                _headers['Content-Type'] = httpHeaders.ContentType;
                            }
                            if (httpHeaders['Content-Length']) {
                                _headers['Content-Length'] = httpHeaders['Content-Length'];
                            }

                            fetch(this.state.ptuUrlOverride.length ? this.state.ptuUrlOverride : message._parameters.url, { 
                                method: 'POST', headers: _headers, body: httpBody
                            }).then(async(res) => {
                                if (res.ok) {
                                    var osrResponse = new document.SDL.rpc.messages.SystemRequest();
                                    osrResponse.setCorrelationId(65535);
                                    osrResponse.setRequestType(document.SDL.rpc.enums.RequestType.PROPRIETARY);
                                    var uint8encoder = new TextEncoder();
                                    osrResponse.setBulkData(uint8encoder.encode(await res.text()));
                                    console.log("GOT PTU: ", osrResponse);
                                    document.sdlManager._lifecycleManager.sendRpcMessage(osrResponse);
                                } else {
                                    console.warn('PTU URL returned bad status code', res.status, res.statusText);
                                }
                            });
                        }, 5);
                    } else if (message._parameters.requestType === document.SDL.rpc.enums.RequestType.ICON_URL
                        && 'HTTP' === message._parameters.fileType) {
                        setTimeout(fetch(message._parameters.url).then((res) => {
                            if (res.ok) {
                                var osrResponse = new document.SDL.rpc.messages.SystemRequest();
                                osrResponse.setFileName(message._parameters.url);
                                osrResponse.setRequestType(document.SDL.rpc.enums.RequestType.ICON_URL);
                                osrResponse.setBulkData(res.body());
                                console.log("GOT ICON: ", osrResponse);
                                document.sdlManager._lifecycleManager.sendRpcMessage(osrResponse);
                            } else {
                                console.warn('ICON URL returned bad status code', res.status, res.statusText);
                            }
                        }), 5);
                    }
                }
            }
            return recvFunc.call(document.sdlManager._lifecycleManager, message);
        };

        localStorage.setItem('lastAppState', JSON.stringify(this.state));

        this.props.onConnect();
    }

    render() {
        let hmiTypes = document.apiSpec.enums.AppHMIType;

        var hmiTypeCheckboxes = hmiTypes.map((type) => {
            return (<div className="flex flex-row" key={type}>
            <input className="br2 ba ph2 dark-grey "
                type="checkbox"
                checked={this.state.appHMITypes.includes(type)}
                onChange={event => this.toggleHMIType(type)}
                //style={{width: "100%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
            />
            <p>
                {type}
            </p>
        </div>);
        });

        return (<div className="ph2 mt1" style={{ display: 'flex', flexDirection: 'column'}}>
                <span className="fw5">App ID</span>
                <input className="br2 ba ph2 dark-grey "
                    value={this.state.appId}
                    onChange={event => this.setAppId(event.target.value)}
                    //style={{width: "100%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
                />
                <span className="fw5 mt2">App Name</span>
                <input className="br2 ba ph2 dark-grey"
                    value={this.state.appName}
                    onChange={event => this.setAppName(event.target.value)}
                    //style={{width: "100%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
                />
                <span className="fw5 mt2">App HMI Type</span>
                { hmiTypeCheckboxes }
                <span className="fw5 mt2">WS URL</span>
                <input className="br2 ba ph2 dark-grey "
                    value={this.state.wsUrl}
                    onChange={event => this.setWsUrl(event.target.value)}
                    //style={{width: "100%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
                />
                <span className="fw5 mt2">WS Port</span>
                <input className="br2 ba ph2 dark-grey "
                    value={this.state.wsPort}
                    onChange={event => this.setWsPort(event.target.value)}
                    //style={{width: "100%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
                />
                <span className="fw5 mt2">Hash ID</span>
                <input className="br2 ba ph2 dark-grey"
                    value={this.state.hashId}
                    onChange={event => this.setHashId(event.target.value)}
                    //style={{width: "100%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
                />
                <span className="fw5 mt2">PTU URL Override</span>
                <input className="br2 ba ph2 dark-grey"
                    value={this.state.ptuUrlOverride}
                    onChange={event => this.setPtuOverrideUrl(event.target.value)}
                    //style={{width: "100%", paddingTop: ".5rem", paddingBottom: ".5rem"}}
                />
                <button
                    className="bn br2 outline-0 w-100 black bg-grey--dark cursor-pointer active-bg-manticore-blue active-white mt4"
                    onClick={this.connectApp}
                    style={{ paddingTop: "5px", paddingBottom: "5px" }}
                    >Connect</button>
            </div>);
    }
}
