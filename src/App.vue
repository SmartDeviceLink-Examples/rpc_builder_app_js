<template>
<div class="app">
	<AppConnection/>
	<RPCBuilder/>
	<Logger/>
</div>
</template>

<script>
import AppConnection from './components/AppConnection.vue'
import RPCBuilder from './components/RPCBuilder.vue'
import Logger from './components/Logger.vue'

export default {
	name: 'App',
	components: {
		AppConnection,
		RPCBuilder,
		Logger
	}
}
</script>

<style>
@font-face {
    font-family: 'LivioNorm-Light';
    src: url('./assets/fonts/LivioNorm-Light.ttf');
}

@font-face {
    font-family: 'LivioNorm-Medium';
    src: url('./assets/fonts/LivioNorm-Medium.ttf');
}

@font-face {
    font-family: 'LivioNorm-Regular';
    src: url('./assets/fonts/LivioNorm-Regular.ttf');
}

@font-face {
    font-family: 'LivioNorm-Bold';
    src: url('./assets/fonts/LivioNorm-Bold.ttf');
}

@font-face {
    font-family: 'LivioMono-Regular';
    src: url('./assets/fonts/LivioMono-Regular.ttf');
}

body p {
    font-family: "LivioNorm-Regular", Times, serif;

    margin-block-end: 0;
    margin-block-start: 0;
}

body label {
    font-family: "LivioNorm-Regular", Times, serif;
}

body h2 {
    font-family: "LivioNorm-Medium", Times, serif;

    margin-block-end: 0;
    margin-block-start: 0;
}

body h3 {
    font-family: "LivioNorm-Medium", Times, serif;
}

body button {
    font-family: "LivioNorm-Medium", Times, serif;
}

body {
    width: 100vw;
    height: 100vh;
    margin: 0;
}

body input[type=checkbox] {
    height: 18px;
}

</style>

<style scoped>

    .app {
        height: 100%;
        width: 100%;
    }

</style>