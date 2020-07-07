<template>
	<div class="header">

        <h2>RPC Builder JS</h2>

        <div class="headerRight">
            <input type='file' id='inputFile' style='display:none;' v-on:change="importSavedRpcs">
            <button id="importSavedRpcs" v-on:click="inputClick">Import RPCs</button>
            <button id="exportSavedRpcs" v-on:click="exportSavedRpcs">Export RPCs</button>
            <button id="createRPC" v-on:click="openModal">Create RPC</button>
            <p id="hmiStatus"></p>
        </div>

        <modal name="rpc" id="connect" height="auto" @opened="opened" :clickToClose="false">
            <div class="paramContainer" id="container">
                <h3>Configure RPC</h3>
                <div class="parameter" id="select">
                    <label for="rpcs">Select RPC
                        <input id="irpcs" list="rpcs" name="rpcs" type="text" v-on:change="selected">
                    </label>
                    <datalist id="rpcs"></datalist>
                    <label for="rpcs2">Saved RPCs
                        <input id="irpcs2" list="rpcs2" name="rpcs2" type="text" v-on:change="selected2">
                    </label>
                    <datalist id="rpcs2"></datalist>
                </div>
                <div class="buttons">
                    <button id="cancel" v-on:click="closeModal">Cancel</button>
                    <button id="send" v-on:click="sendRpc">Send</button>
                </div>
            </div>
        </modal>
	</div>
</template>

<script>
export default {
  name: 'RPCBuilder',
  data () {
    return {
        rpcName: undefined,
        params: []
    };
  },
  methods: {
    openModal () {
        this.$modal.show('rpc');
    },
    closeModal () {
        this.$modal.hide('rpc');
    },
    inputClick() {
        document.querySelector('input#inputFile').click();
    },
    importSavedRpcs() {
        var file = document.querySelector('input#inputFile').files[0];
        var reader = new FileReader();

        reader.onload = this.importFinished;
        reader.readAsDataURL(file);
    },
    importFinished(event) {
        var b64data = event.target.result;
        var jsonStr = atob(b64data.substring(b64data.indexOf(",") + 1));
        var json = JSON.parse(jsonStr);

        jsonStr = JSON.stringify(json, null, 4);
        localStorage.setItem('savedRpcs', jsonStr);
    },
    exportSavedRpcs() {
        var link = document.createElement("a");
        link.setAttribute('download', 'saved_rpcs.json');
        link.setAttribute('href', `data:application/octet-stream,${localStorage.getItem('savedRpcs')}`);
        link.click();
    },
    opened () {
        var select = document.querySelector('datalist#rpcs');
        for (var type in document.apiSpec.functions) {
            var option = document.createElement('option');
            option.text = type;
            select.appendChild(option);
        }
        var select2 = document.querySelector('datalist#rpcs2');
        var savedRpcs = localStorage.getItem('savedRpcs');
        if (savedRpcs) {
            var savedList = JSON.parse(savedRpcs);
            for (var savedRpc of savedList) {
                var option = document.createElement('option');
                option.text = savedRpc.name;
                select2.appendChild(option);
            }
        }
        document.querySelector('input#irpcs').focus();
    },
    selected () {
        this.rpcName = document.querySelector('input#irpcs').value;
        var rpc = document.apiSpec.functions[this.rpcName];

        if (!rpc) {
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

        var modal = document.querySelector('div#container');
        modal.childNodes[0].innerText = `Configure ${this.rpcName}`;
        while (modal.childNodes.length > 2) {
            modal.removeChild(modal.childNodes[1]);
        }

        const createParam = require('../../public/client/parameters.js').default;
        for (var param of rpc) {
            var paramObj = createParam(param);
            this.params.push(paramObj);
            modal.insertBefore(paramObj.html(), modal.lastChild);
        }
    },
    selected2() {
        var savedRpcName = document.querySelector('input#irpcs2').value;
        var savedRpcStr = localStorage.getItem('savedRpcs');
        var savedRpcs = JSON.parse(savedRpcStr);
        var savedRpc = null;

        for (var _rpc of savedRpcs) {
            if (_rpc.name === savedRpcName) {
                savedRpc = _rpc;
                break;
            }
        }

        this.rpcName = savedRpc.rpc;
        var rpc = document.apiSpec.functions[this.rpcName];

        if (!rpc) {
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

        var modal = document.querySelector('div#container');
        modal.childNodes[0].innerText = `Configure ${this.rpcName}`;
        while (modal.childNodes.length > 2) {
            modal.removeChild(modal.childNodes[1]);
        }

        const createParam = require('../../public/client/parameters.js').default;
        for (var param of rpc) {
            var savedParam = param.name === 'bulkData' ? savedRpc.bulkData : savedRpc.parameters[param.name];
            var paramObj = createParam(param);

            this.params.push(paramObj);
            modal.insertBefore(paramObj.html(), modal.lastChild);

            if (!savedParam) {
                paramObj.setIncluded(false);
            } else {
                paramObj.setValue(savedParam);
            }
        }
    },
    hideModal () {
      this.$modal.hide('rpc');
    },
    sendRpc () {
        var bulkData = undefined;

        var parameters = {};
        for (var param of this.params) {
            if (param.included()) {
                parameters[param._name] = param.value();
            } else if (param._name === 'bulkData') {
                bulkData = param.value();
            }
        }

        const rpc = new document.SDL.rpc.messages[this.rpcName]({ parameters: parameters });

        if (bulkData) {
            rpc.setBulkData(bulkData);
        }

        document.sdlManager.sendRpc(rpc);
        this.closeModal();
    }
  }
}
</script>

<style>

.rpcParam {
    flex: 1;
    width: 100%;
    margin-bottom: 1%;
    height: 24px;

    display: flex;
    flex-direction: row;
}

.rpcParamContainer {
    flex: 1;
    width: 100%;

    display: flex;
    flex-direction: column;
}

.rpcParamChild {
    flex: 1;
    width: 100%;
    margin-bottom: 1%;
    height: 24px;

    display: flex;
    flex-direction: row;
}

.rpcParam input {
    height: 18px;
}

.rpcParamChild button {
    height: 24px;
}

</style>

<style scoped>
.paramContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding-left: 5%;
    padding-right: 5%;
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
    margin: 2%;
}

label {
    display: block;
}

input {
    display: block;
}

.header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    height: 10%;
    padding: 0 10%;
}

.headerRight {
    text-align: right;
    min-width: 70%;
    padding: 10px;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    height: 24px;
    margin-bottom: 2%;
}

.buttons button {
    height: 20px;
    width: 60px;

    margin: auto;
    margin-left: 2%;
    margin-right: 2%;
}

</style>