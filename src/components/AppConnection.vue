<template>
	<div id="hidden">
        <modal name="app-config" id="connect" height="auto" @before-close="beforeClose" @opened="opened" :clickToClose="false">
            <div class="paramContainer">
                <h3>Configure Application</h3>
                <div class="parameter"><label for="id">Application ID</label><input type="text" id="id" value="rpcb-js"/></div>
                <div class="parameter"><label for="name">Application Name</label><input type="text" id="name" value="RPC Builder"/></div>
                <div class="parameter"><label for="types">App HMI Types</label><select id="types"/></div>
                <div class="parameter"><label for="wsUrl">WS URL</label><input type="text" id="wsUrl" value="ws://"/></div>
                <div class="parameter"><label for="wsPort">WS Port</label><input type="text" id="wsPort" value="2020"/></div>
                <button id="connect" v-on:click="closeModal">CONNECT</button>
            </div>
        </modal>
	</div>
</template>

<script>
export default {
  name: 'AppConnection',
  data () {
    return {};
  },
  created: function() {
        var remote = 'smartdevicelink';
        var branch = 'develop';

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
            that.openModal();
        });
  },
  methods: {
    openModal () {
        this.$modal.show('app-config');
    },
    closeModal () {
        this.$modal.hide('app-config');
    },
    opened () {
        var select = document.querySelector('select#types');
        for (var type of document.apiSpec.enums.AppHMIType) {
            var option = document.createElement('option');
            option.text = type;
            select.appendChild(option);
        }
    },
    hideModal () {
      this.$modal.hide('app-config');
    },
    beforeClose (event) {
        var appId = document.querySelector('input#id').value;
        var appName = document.querySelector('input#name').value;
        var typeElem = document.querySelector('select#types');
        var appHMIType = typeElem.childNodes[typeElem.selectedIndex].value;
        var wsUrl = document.querySelector('input#wsUrl').value;
        var wsPort = document.querySelector('input#wsPort').value;

        if (wsUrl === 'ws://') {
            event.cancel();
            alert('please fill in connection url');
            return;
        }

        const SDL = require('../../public/SDL.min.js');
        document.SDL = SDL;

        const lifecycleConfig = new SDL.manager.LifecycleConfig()
            .setAppId(appId)
            .setAppName(appName)
            .setLanguageDesired(SDL.rpc.enums.Language.EN_US)
            .setAppTypes([ appHMIType ]);

        lifecycleConfig.setTransportConfig(new SDL.transport.WebSocketClientConfig(wsUrl, wsPort));

        const filePath = './public/app_icon.png';
        const file = new SDL.manager.file.filetypes.SdlFile()
            .setName('AppIcon')
            .setFilePath(filePath)
            .setType(SDL.rpc.enums.FileType.GRAPHIC_PNG)
            .setPersistent(true);

        lifecycleConfig.setAppIcon(file);

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
        document.SDL.rpc.RpcStruct._validateType = function() { return true; }

        // log outgoing RPCs
        const sendFunc = document.sdlManager._lifecycleManager.sendRpcMessage;
        document.sdlManager._lifecycleManager.sendRpcMessage = async (message) => {
            if (document.logRpc) { document.logRpc(message); }
            return sendFunc.call(document.sdlManager._lifecycleManager, message);
        };

        // log incoming RPCs
        const recvFunc = document.sdlManager._lifecycleManager._handleRpc;
        document.sdlManager._lifecycleManager._handleRpc = async (message) => {
            if (document.logRpc) { document.logRpc(message); }
            return recvFunc.call(document.sdlManager._lifecycleManager, message);
        };
    }
  }
}
</script>

<style scoped>

.hidden {
    height: 0;
    width: 0;
}

.paramContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.parameter {
    flex: 1;
    width: 50%;
    margin-bottom: 1%;
}

.parameter input {
    width: 100%;
}

.parameter select {
    width: 100%;
}

button {
    margin-top: 2%;
    margin-bottom: 2%;
}

label {
    display: block;
}

input {
    display: block;
}

</style>