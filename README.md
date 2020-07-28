# RPC Builder JS

RPC Builder JS is a web application that can dynamically create RPCs and interact with SDL Core. This is useful for testing SDL implementations.

<img width="595" alt="rpc_builder_app_js" src="https://user-images.githubusercontent.com/12716076/88192669-ced49900-cc0a-11ea-96ab-6c86bb05c7d1.png">

## Dependencies

RPC Builder JS is built using [node](https://nodejs.org/) version 12 and vueJS.

RPC Builder JS is built on top of the [sdl_javascript_suite](https://github.com/smartdevicelink/sdl_javascript_suite) and includes SDL.min.js from [release 1.0.0](https://github.com/smartdevicelink/sdl_javascript_suite/tree/1.0.0).

## Installation

```bash
git clone https://github.com/SmartDeviceLink-Examples/rpc_builder_app_js
cd rpc_builder_app_js
npm install
```

## Usage

```bash
cd rpc_builder_app_js
npm run serve
```

Navigate to `$HOST:8080` in your browser to access the web app.

### Changing the Spec

```bash
cd rpc_builder_app_js
npm run api <branch>
```

Replace `<branch>` with the branch of the `rpc_spec` you wish to test against.
This will change the rpc_builder to use that version of the MOBILE_API and sdl_javascript_suite for testing.

## Contributing
Contributions are welcome but to prevent duplicate efforts please open an issue to discuss any potential changes before developing them.
