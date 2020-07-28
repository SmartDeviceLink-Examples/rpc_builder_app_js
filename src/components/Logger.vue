<template>
	<div class="logger">
		<div class="logControls">
			<input type="text" id="logFilter" placeholder="filter logs" v-on:change="filter"/>
			<button v-on:click="clearLogs">Clear Logs</button>
		</div>
		<div class="logContainer" id="logContainer" v-on:scroll="onScroll">

		</div>
		<modal name="save-rpc" id="saveRpc" height="auto" @before-close="beforeClose" @opened="opened" :clickToClose="false">
			<div class="saveRpcContainer">
				<h3>Save RPC</h3>
				<div class="parameter"><label for="name">Name</label><input type="text" id="name" placeholder="saved rpc"/></div>
				<div class="parameter"><label for="rpcName">RPC</label><input type="text" id="rpcName" disabled/></div>
				<label for="parameters">Parameters:</label><br><p id="parameters"/>
				<div class="buttons">
					<button id="cancel" v-on:click="cancelSave">CANCEL</button>
					<button id="btnSaveRpc" v-on:click="closeModal">SAVE RPC</button>
				</div>
			</div>
		</modal>
	</div>
</template>

<script>
export default {
	data: function() {
		return {
			keepUpWithHistory: true,
			pendingSavedRpc: null,
			cancelled: false
		};
	},
	created: function() {
		var that = this;
		document.logRpc = function(rpc) {
			var containerRef = document.querySelector('div#logContainer');

			if (rpc && containerRef) {
				var log = document.createElement('p');
				if (rpc._messageType === 1 && rpc._parameters && !rpc._parameters.success) {
					log.setAttribute('style', 'color: #C0002F;');
				}
				log.innerHTML = `<strong>${rpc._functionName}</strong><span class="logParams">${JSON.stringify(rpc._parameters, null, 4)}</span>`;
				containerRef.appendChild(log);

				log.ondblclick = () => {
					that.initSaveRpc(rpc._functionName, rpc._parameters, rpc._bulkData);
				}

				if (that.keepUpWithHistory) {
					containerRef.scrollTop = containerRef.scrollHeight;
				}
			}
		}
	},
	methods: {
		openModal () {
			this.$modal.show('save-rpc');
		},
		closeModal () {
			this.$modal.hide('save-rpc');
		},
		cancelSave() {
			this.cancelled = true;
			this.closeModal();
		},
		initSaveRpc(rpcName, rpcParams, rpcBulkData) {
			this.pendingSavedRpc = { 
				rpc: rpcName,
				parameters: rpcParams
			};
			if (rpcBulkData) {
				this.pendingSavedRpc.bulkData = rpcBulkData;
			}
			this.openModal();
		},
		opened() {
			document.querySelector('input#rpcName').setAttribute('placeholder', this.pendingSavedRpc.rpc);
			document.querySelector('p#parameters').innerHTML = JSON.stringify(this.pendingSavedRpc.parameters, null, 4).replace(/(?:\r\n|\r|\n)/g, '<br>');
		},
		onScroll () {
			var containerRef = document.querySelector('div#logContainer');
			this.keepUpWithHistory = (containerRef.scrollTop + window.innerHeight * 0.95) >= containerRef.scrollHeight;
		},
		clearLogs () {
			var containerRef = document.querySelector('div#logContainer');
			while (containerRef.lastElementChild) {
				containerRef.removeChild(containerRef.lastElementChild);
			}
		},
		filter () {
			var containerRef = document.querySelector('div#logContainer');
			var filterRef = document.querySelector('input#logFilter');
			var filterVal = filterRef.value;

			for (var child of containerRef.childNodes) {
				if (filterVal === '') {
					child.setAttribute('style', `display: ''`);
					continue;
				}

				var rpcName = child.childNodes[0].innerHTML;
				if (rpcName.includes(filterVal)) {
					child.setAttribute('style', `display: ''`);
					continue;
				}

				var rpcParameters = child.lastElementChild.innerHTML;
				if (rpcParameters.includes(filterVal)) {
					child.setAttribute('style', `display: ''`);
					continue;
				}

				child.setAttribute('style', `display: none`);
			}
		},
		beforeClose (event) {
			if (this.cancelled) {
				this.cancelled = false;
				return;
			}

			var savedRpcName = document.querySelector('input#name').value;

			if (savedRpcName === '') {
				event.cancel();
				alert('please name the new saved rpc');
				return;
			}

			this.pendingSavedRpc.name = savedRpcName;

			if (this.pendingSavedRpc.bulkData) {
				console.log('converting bulk data: ', this.pendingSavedRpc.bulkData);
				this.pendingSavedRpc.bulkData = Object.values(this.pendingSavedRpc.bulkData);
				console.log('bulk data converted: ', this.pendingSavedRpc.bulkData);
			}

			if (typeof (Storage) !== "undefined") {
				var savedRpcs = localStorage.getItem('savedRpcs');
				if (!savedRpcs) {
					localStorage.setItem('savedRpcs', JSON.stringify([ this.pendingSavedRpc ], null, 4));
				} else {
					var json = JSON.parse(savedRpcs);
					for (var rpc of json) {
						if (rpc.name === savedRpcName) {
							event.cancel();
							alert('you already have a saved rpc with the same name');
							return;
						}
					}
					json.push(this.pendingSavedRpc);
					var jsonStr = JSON.stringify(json, null, 4);
					localStorage.setItem('savedRpcs', jsonStr);
				}
			} else {
				alert('local storage is not supported by your browser');
			}
			this.pendingSavedRpc = null;
		}
	}
}
</script>

<style>

.logger {
	height: 88%;
	width: 100%;
}

.saveRpcContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

	height: 95%;
	width: 100%;
	padding: 0 2%;
	overflow-y: scroll;
}

.logContainer {
	display: flex;
	flex-direction: column;

	height: 95%;
	width: 100%;
	padding: 0 2%;
	overflow-y: scroll;
}

.logContainer p:nth-child(2n) {
	background-color: #65A0FF;
}

.logContainer p {
	font-family: "LivioMono-Regular", Times, serif;
}

.logParams {
	font-size: x-small;
	overflow-wrap: break-word;
}

</style>

<style scoped>

.logControls {
	height: 5%;
	padding: 0 5%;

	display: flex;
	flex-direction: row;
	align-items: center;
}

.logControls input {
	width: 30%;
	height: 14px;
}

.logControls button {
	margin-left: auto;
	height: 18px;
}

#parameters {
	max-height: 40vh;
	overflow-y: scroll;
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

.buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    height: 24px;
    margin: 2% 0%;
}

.buttons button {
	margin: 2%;
	width: 10vw;
}

</style>