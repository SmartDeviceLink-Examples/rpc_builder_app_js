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
        this.connectApp = this.connectApp.bind(this);

        this.state = {
            appId: 'rpcb-js',
            appName: 'RPC Builder',
            appHMITypes: [],
            wsUrl: 'ws://',
            wsPort: 2020,
            hashId: null
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

    connectApp() {
        if (this.state.wsUrl === 'ws://') {
            alert('please fill in connection url');
            return;
        }

        console.log('connecting app: ', this.state);

        const SDL = require('../../public/SDL.min.js');
        document.SDL = SDL;

        const lifecycleConfig = new SDL.manager.LifecycleConfig()
            .setAppId(this.state.appId)
            .setAppName(this.state.appName)
            .setLanguageDesired(SDL.rpc.enums.Language.EN_US)
            .setAppTypes(this.state.appHMITypes)
            .setVrSynonyms([ this.state.appName ])
            .setResumeHash(this.state.hashId);

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
            console.log('SEND', message);
            if (!message) { return; }
            if (document.logRpc) { document.logRpc(message); }
            return sendFunc.call(document.sdlManager._lifecycleManager, message);
        };

        // log incoming RPCs
        const recvFunc = document.sdlManager._lifecycleManager._handleRpc;
        document.sdlManager._lifecycleManager._handleRpc = async (message) => {
            if (document.logRpc) { document.logRpc(message); }
            if (message && message._messageType === 0 && message._functionName === 'GetAppServiceData') {
                setTimeout(() => { // incoming app service data subscription request, ask user how to reply
                    var response = new document.SDL.rpc.messages.GetAppServiceDataResponse();
                    response.setCorrelationId(message._correlationID);
                    var allow = window.confirm(`request to subscribe to ${message.getParameter('serviceType')} app service data, allow or deny?`);
                    response.setSuccess(allow);
                    response.setResultCode(allow ? "SUCCESS" : "REJECTED");
                    document.sdlManager._lifecycleManager.sendRpcMessage(response);
                }, 5);
            }
            return recvFunc.call(document.sdlManager._lifecycleManager, message);
        };

        this.props.onConnect();
    }

    render() {
        let hmiTypes = document.apiSpec.enums.AppHMIType;

        var hmiTypeCheckboxes = hmiTypes.map((type) => {
            return (<div className="flex flex-row" key={type}>
            <input className="br2 ba ph2 dark-grey "
                type="checkbox"
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
                <button 
                    className="bn br2 outline-0 w-40 black bg-grey--dark cursor-pointer active-bg-manticore-blue active-white mt4"
                    onClick={this.connectApp}
                    style={{ paddingTop: "5px", paddingBottom: "5px" }}
                    >Connect</button>
            </div>);
    }
}