import React from 'react';

import FavRpcOption from './FavRpcOption'

export default class FavRpcs extends React.Component {
    constructor(props) {
        super(props);

        this.importSavedRpcs = this.importSavedRpcs.bind(this);
        this.importFinished = this.importFinished.bind(this);

        var savedRpcList = [];
        var savedRpcs = localStorage.getItem('savedRpcs');

        if (savedRpcs) {
            savedRpcList = JSON.parse(savedRpcs);
        }

        this.state = {
            savedRpcs: savedRpcList
        }
    }

    importSavedRpcs(input) {
        console.log('importSavedRpcs', input);
        var file = input.files[0];
        var reader = new FileReader();
        reader.onload = this.importFinished;
        reader.readAsDataURL(file);
    }

    importFinished(event) {
        console.log('importFinished', event);
        var b64data = event.target.result;
        var jsonStr = atob(b64data.substring(b64data.indexOf(",") + 1));
        var json = JSON.parse(jsonStr);
        this.setState({ savedRpcs: json });
        jsonStr = JSON.stringify(json, null, 4);
        console.log('localStorage.setItem', jsonStr);
        localStorage.setItem('savedRpcs', jsonStr);
    }

    exportSavedRpcs() {
        var link = document.createElement("a");
        link.setAttribute('download', 'saved_rpcs.json');
        link.setAttribute('href', `data:application/octet-stream,${localStorage.getItem('savedRpcs')}`);
        link.click();
    }

    clickLoad() {
        var input = document.createElement("input");
        input.setAttribute("type", "file");
        input.onchange = () => { this.importSavedRpcs(input) };
        input.click();
        return false;
    }

    render() {
        var that = this;

        return (<div>
            <div className="fav_btns bb b--grey--light">
                <button onClick= { event => that.clickLoad() }
                        className="bn br2 outline-0 w-40 black bg-grey--dark cursor-pointer active-bg-manticore-blue active-white mv2"
                        style={{ paddingTop: "5px", paddingBottom: "5px" }}>
                            Load
                    </button>
                <button onClick= { event => that.exportSavedRpcs()}
                        className="bn br2 outline-0 w-40 black bg-grey--dark cursor-pointer active-bg-manticore-blue active-white mv2"
                        style={{ paddingTop: "5px", paddingBottom: "5px" }}>
                            Save
                    </button>
            </div>
            <div class="fav_rpcs">
                { this.state.savedRpcs.map(rpc => 
                    <FavRpcOption rpc={rpc} handleClick={() => that.props.loadSavedRpc(rpc)} />
                )}
            </div>
        </div>);
    }
}