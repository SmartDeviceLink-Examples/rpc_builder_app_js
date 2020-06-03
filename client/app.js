
function connect(appId, appName, hmiTypes, wsURI, wsPort) {
    const lifecycleConfig = new SDL.manager.LifecycleConfig()
        .setAppId(appId)
        .setAppName(appName)
        .setLanguageDesired(SDL.rpc.enums.Language.EN_US)
        .setAppTypes(hmiTypes);

    lifecycleConfig.setTransportConfig(new SDL.transport.WebSocketClientConfig(wsURI, wsPort));

    const filePath = './app_icon.png';
    const file = new SDL.manager.file.filetypes.SdlFile()
        .setName('AppIcon')
        .setFilePath(filePath)
        .setType(SDL.rpc.enums.FileType.GRAPHIC_PNG)
        .setPersistent(true);

    lifecycleConfig.setAppIcon(file);

    const appConfig = new SDL.manager.AppConfig()
        .setLifecycleConfig(lifecycleConfig);

    const managerListener = new SDL.manager.SdlManagerListener()
        .setOnStart((sdlManager) => {
            // managers are ready
        })
        .setOnError((sdlManager, info) => {
            console.error('Error from SdlManagerListener: ', info);
        });

    document.sdlManager = new SDL.manager.SdlManager(appConfig, managerListener)
        .start()
        .addRpcListener(SDL.rpc.enums.FunctionID.OnHMIStatus, (onHmiStatus) => {
            // HMI Level updates
            document.getElementById('hmiStatus').innerHTML =
                `HMI Level: ${onHmiStatus.getHmiLevel()}`;
        });

    // override the send rpc message to intercept requests and responses to store them
    const sendFunc = document.sdlManager._lifecycleManager.sendRpcMessage;
    document.sdlManager._lifecycleManager.sendRpcMessage = async (message) => {
        document.logRpc(message); // log the request
        const response = await sendFunc.call(document.sdlManager._lifecycleManager, message).catch(err => err);
        document.logRpc(response); // log the response
        return response;
    };

    //listen for every notification
    for (let className in SDL.rpc.messages) {
        const rpcInstance = new SDL.rpc.messages[className]();
        if (rpcInstance.getMessageType() !== SDL.rpc.enums.MessageType.notification) {
            continue;
        }
        // listen for all notifications
        const functionIdName = rpcInstance.getFunctionId();
        document.sdlManager.addRpcListener(SDL.rpc.enums.FunctionID.valueForKey(functionIdName), document.logRpc);
    }
}

export { connect };