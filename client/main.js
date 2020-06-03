import { connect } from './app.js'
import { createParam } from './parameters.js'
import { getApiSpec } from './spec.js'

function init() {
    document.keepUpWithHistory = true;
    document.logRpc = function(rpc) {
        var pTag = document.createElement('p');
        pTag.innerHTML = `${rpc._functionName}: ${JSON.stringify(rpc._parameters)}`;

        var history = document.getElementById('history');
        history.appendChild(pTag);
        if (document.keepUpWithHistory) {
            history.scrollTop = history.scrollHeight;
        }
    }

    var history = document.getElementById('history');
    history.onscroll = function() {
        document.keepUpWithHistory = (this.scrollTop + window.innerHeight * 0.3) >= this.scrollHeight;
    }

    fetch('https://api.github.com/repos/smartdevicelink/generic_hmi/contents/src/img/static').then(res => res.json()).then(contents => {
        document.staticImageValues = contents.map(file => file.name);
    });

    document.getElementById('regConnect').onclick = function() {
        var appId = document.getElementById('regAppId').value;
        var appName = document.getElementById('regAppName').value;

        var appHmiTypeSelect = document.getElementById('regAppHmiTypes');
        var appHmiTypes = [];
        for (var option of appHmiTypeSelect.options) {
            if (option.selected) {
                appHmiTypes.push(option.text);
            }
        }

        var wsURI = document.getElementById('regCoreWsURI').value;
        var wsPort = document.getElementById('regCoreWsPort').value;

        connect(appId, appName, appHmiTypes, wsURI, wsPort);
    }

    document.getElementById('irpcs').onchange = function() {
        if (!document.apiSpec.functions[this.value]) {
            return;
        }
        
        var parameters = [];
        document.rpc = this.value;
        document.params = [];
        for (var param in document.apiSpec.functions[this.value]) {
            parameters.push(document.apiSpec.functions[this.value][param]);
        }

        parameters.sort((a, b) => { 
            if (a.mandatory === 'true' && b.mandatory === 'false') {
                return -1;
            } else if (b.mandatory === 'true' && a.mandatory === 'false') {
                return 1;
            }

            return 0;
        });

        var rpcForm = document.getElementById('rpcForm');
        while (rpcForm.lastElementChild) {
            rpcForm.removeChild(rpcForm.lastElementChild);
        }
        for (var param of parameters) {
            var paramObj = createParam(param);
            document.params.push(paramObj);
            rpcForm.appendChild(paramObj.html());
        }
    }

    document.getElementById('sendRpc').onclick = function() {
        var parameters = {};
        for (var param of document.params) {
            if (param.included()) {
                parameters[param._name] = param.value();
            }
        }

        // find a way to send RPCs raw (set correlationId, functionId, etc.)
        const rpc = new SDL.rpc.messages[document.rpc]({ parameters: parameters });
        document.sdlManager.sendRpc(rpc);
    }

    var specLoadedCallback = function() {
        var appHmiTypeSelect = document.getElementById('regAppHmiTypes');
        for (var type of document.apiSpec.enums.AppHMIType) {
            var option = document.createElement('option');
            option.text = type;
            appHmiTypeSelect.appendChild(option)
        }

        var rpcSelect = document.getElementById('rpcs');
        for (var rpc in document.apiSpec.functions) {
            var option = document.createElement('option');
            option.text = rpc;
            rpcSelect.appendChild(option);
        }
    };

    document.getElementById('updateSpec').onclick = function() {
        var branch = document.getElementById('specBranch').value;
        var remote = document.getElementById('specRemote').value;

        getApiSpec(specLoadedCallback, branch, remote);
    }

    getApiSpec(specLoadedCallback);
}

document.onreadystatechange = init;
