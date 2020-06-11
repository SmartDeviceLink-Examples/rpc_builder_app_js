<template>
	<div class="header">

        <h2>SDL Proxy Tester</h2>

        <div class="headerRight">
            <button id="createRPC" v-on:click="openModal">Create RPC</button>
            <modal name="rpc" id="connect" height="auto" @before-open="beforeOpen" @before-close="beforeClose" @opened="opened" :clickToClose="false">
                <div class="paramContainer" id="container">
                    <h3>Configure RPC</h3>
                    <div class="parameter" id="select">
                        <label for="rpcs">Select RPC
                            <input id="irpcs" list="rpcs" name="rpcs" type="text" v-on:change="selected">
                        </label>
                        <datalist id="rpcs"></datalist>
                    </div>
                    <div class="buttons">
                        <button id="cancel" v-on:click="closeModal">CANCEL</button>
                        <button id="send" v-on:click="sendRpc">SEND</button>
                    </div>
                </div>
            </modal>
        </div>

        <p id="hmiStatus"></p>

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
  created: function() {
      // do stuffs when this is created
  },
  methods: {
    openModal () {
        this.$modal.show('rpc');
    },
    closeModal () {
        this.$modal.hide('rpc');
    },
    opened () {
        var select = document.querySelector('datalist#rpcs');
        for (var type in document.apiSpec.functions) {
            var option = document.createElement('option');
            option.text = type;
            select.appendChild(option);
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
    hideModal () {
      this.$modal.hide('rpc');
    },
    beforeOpen (/*event*/) {
        //console.log('event:', event);
    },
    beforeClose (/*event*/) {
        // if this was not called by button, cancel event, otherwise, verify params
        // if params dont meet constraints, popup a confirm before sending
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
        margin-top: 2%;
        margin-bottom: 2%;
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
        margin-left: auto;
        padding: 10px;
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