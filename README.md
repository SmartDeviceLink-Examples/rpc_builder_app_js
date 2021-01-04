# RPC Builder JS

RPC Builder JS is a web application that can dynamically create RPCs and interact with SDL Core. This is useful for testing SDL implementations.

<img width="1246" alt="rpcbjs_preview.png" src="https://user-images.githubusercontent.com/12716076/103576777-a9c6a080-4ea1-11eb-91ac-86af8034e8d6.png">

## Dependencies

RPC Builder JS is built using [create-react-app](https://facebook.github.io/create-react-app/docs/getting-started).

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
npm run start
```

## Available Scripts

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run api`

Changes which version of the rpc_spec this app will use.<br />
Example usage: `npm run api origin smartdevicelink develop`

This command will build the sdl_javascript_suite locally, and modify where the app will be pulling its MOBILE_API.xml

## Saved RPCs

RPCs can be saved from the construct RPC view.
RPCs are saved to local webkit storage, but can be exported in JSON format.

Example JSON of some testing RPCs:

```json
{
    "rpc": "ListFiles",
    "parameters": {},
    "name": "listFiles"
},
{
    "rpc": "SubtleAlert",
    "parameters": {
        "alertText1": "hello",
        "alertText2": "world",
        "playTone": true,
        "cancelID": 42
    },
    "name": "subtleHelloWorld"
},
{
    "rpc": "SubtleAlert",
    "parameters": {
        "alertText1": "hello",
        "alertText2": "world",
        "duration": 10000,
        "playTone": true,
        "softButtons": [
            {
                "type": "IMAGE",
                "softButtonID": 51,
                "text": "sb1",
                "image": {
                    "value": "0x25",
                    "imageType": "STATIC",
                    "isTemplate": true
                },
                "isHighlighted": true,
                "systemAction": "DEFAULT_ACTION"
            },
            {
                "type": "IMAGE",
                "softButtonID": 52,
                "text": "sb2",
                "image": {
                    "value": "0x27",
                    "imageType": "STATIC",
                    "isTemplate": true
                },
                "isHighlighted": true,
                "systemAction": "DEFAULT_ACTION"
            }
        ],
        "alertIcon": {
            "value": "0x21",
            "imageType": "STATIC",
            "isTemplate": true
        },
        "cancelID": 42
    },
    "name": "subtle2sb"
},
{
    "rpc": "PutFile",
    "parameters": {
        "syncFileName": "AppIcon",
        "fileType": "GRAPHIC_PNG",
        "persistentFile": true
    },
    "bulkData": [
        60,
        33,
        ...
        62
    ],
    "name": "putFileAppIcon"
}
```
