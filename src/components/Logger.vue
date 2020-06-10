<template>
	<div class="logger">
		<div class="logControls">
			<input type="text" id="logFilter" placeholder="filter logs" v-on:change="filter"/>
			<button v-on:click="clearLogs">CLEAR LOGS</button>
		</div>
		<div class="logContainer" id="logContainer" v-on:scroll="onScroll">

		</div>
	</div>
</template>

<script>
export default {
	data: function() {
		return {
			keepUpWithHistory: true
		};
	},
	created: function() {
		var that = this;
		document.logRpc = function(rpc) {
			var containerRef = document.querySelector('div#logContainer');

			if (rpc && containerRef) {
				var log = document.createElement('p');
				if (rpc._messageType === 1 && rpc._parameters && !rpc._parameters.success) {
					log.setAttribute('style', 'color: #65A0FF;');
				}
				log.innerHTML = `<strong>${rpc._functionName}</strong><span class="logParams">${JSON.stringify(rpc._parameters)}</span>`;
				containerRef.appendChild(log);

				if (that.keepUpWithHistory) {
					containerRef.scrollTop = containerRef.scrollHeight;
				}
			}
		}
	},
	methods: {
		onScroll () {
			var containerRef = document.querySelector('div#logContainer');
			var temp = this.keepUpWithHistory;
			this.keepUpWithHistory = (containerRef.scrollTop + window.innerHeight * 0.95) >= containerRef.scrollHeight;

			if (temp != this.keepUpWithHistory) {
				console.log('this.keepUpWithHistory ->', this.keepUpWithHistory)
			}
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

			console.log('filterVal', filterVal);

			for (var child of containerRef.childNodes) {
				if (filterVal === '') {
					child.setAttribute('style', `display: ''`);
					continue;
				}

				var rpcName = child.childNodes[0].innerHTML;
				console.log('RPC: ', rpcName);
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
		}
	}
}
</script>

<style>

.logger {
	height: 88%;
	width: 100%;
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
	background-color: #5080CC;
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

</style>