import React from 'react';

import ToggleSwitch from '../ToggleSwitch'
import Select from '../Select';

export function api2html(that, param, value = undefined) {
    if (param.array === 'true') {
        return (<ArrayParameter param={param} included={that.state.parameters[param.name].included}
            value={value}
            setIncluded={(included) => that.setIncluded(param.name, included)} 
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    else if (param.type === 'Boolean') {
        return (<BoolParameter param={param} included={that.state.parameters[param.name].included}
            value={value}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    else if (param.type === 'Integer') {
        return (<IntParameter param={param} included={that.state.parameters[param.name].included}
            value={value} parse={parseInt}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    else if (param.type === 'Float') {
        return (<IntParameter param={param} included={that.state.parameters[param.name].included}
            value={value} parse={parseFloat}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    else if (param.type === 'String') {
        return (<StringParameter param={param} included={that.state.parameters[param.name].included}
            value={value}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    else if (param.type === 'Image') {
        return (<ImageParameter param={param} included={that.state.parameters[param.name].included}
            value={value}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    else if (param.type in document.apiSpec.enums) {
        return (<EnumParameter param={param} included={that.state.parameters[param.name].included}
            value={value}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    else if (param.type in document.apiSpec.structs) {
        return (<StructParameter param={param} included={that.state.parameters[param.name].included}
            value={value}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }

    if (param.name === 'bulkData') {
        return (<FileParameter param={param} included={that.state.parameters[param.name].included}
            value={value}
            setIncluded={(included) => that.setIncluded(param.name, included)}
            setValue={(val) => that.setParamValue(param.name, val)} />);
    }
    
    return (<Parameter param={param} />);
}

export class Parameter extends React.Component {
    render() {
        return (<div>
                <span className="fw5">{`${this.props.param.name} is unknown param type ${this.props.param.type}`}</span>
                <br></br>
            </div>);
    }
}

export class BoolParameter extends Parameter {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        this.state = {
            value: false
        }
    }

    toggle() {
        let val = !this.state.value;
        this.setState({ value: val });
        this.props.setValue(val);
        this.props.setIncluded(true);
    }

    render() {
        return (<div key={this.props.param.name} className="basic_param">
                <div className="basic_param_internal">
                    <input className="br2 ba ph2 dark-grey b--grey--light"
                        type="checkbox"
                        checked={this.props.included}
                        onChange={event => { this.props.setIncluded(event.target.checked); }}
                    />
                    <span key="save" className="param_name">{this.props.param.name}</span>
                </div>
                <ToggleSwitch
                    value={this.state.value}
                    onChange={this.toggle}
                    true= "true"
                    false= "false"
                    className= "">
                </ToggleSwitch>
            </div>);
    }
}

export class IntParameter extends Parameter {
    constructor(props) {
        super(props);

        this.set = this.set.bind(this);
    }

    set(e) {
        if (e.target && e.target.value) {
            this.props.setIncluded(true);
            this.props.setValue(this.props.parse(e.target.value));
        }
    }

    render() {
        var bounds = '';
        if (this.props.param.minvalue !== undefined && this.props.param.maxvalue !== undefined) {
            bounds = ` (${this.props.param.minvalue} - ${this.props.param.maxvalue})`;
        } else if (this.props.param.minvalue !== undefined) {
            bounds = ` (min: ${this.props.param.minvalue})`;
        } else if (this.props.param.maxvalue !== undefined) {
            bounds = ` (max: ${this.props.param.maxvalue})`;
        }

        return (<div key={this.props.param.name} className="basic_param">
                <div className="basic_param_internal">
                    <input className="br2 ba ph2 dark-grey b--grey--light"
                        type="checkbox"
                        checked={this.props.included}
                        onChange={event => { this.props.setIncluded(event.target.checked); }}
                    />
                    <span key="save" className="param_name">{this.props.param.name + bounds}</span>
                </div>
                <input className="br2 ba ph2 dark-grey b--grey--light"
                    type="number"
                    onChange={this.set}
                    style={{ width: "40%" }}
                    value={this.props.value}
                />
            </div>);
    }
}

export class StringParameter extends Parameter {
    constructor(props) {
        super(props);

        this.set = this.set.bind(this);
    }

    set(e) {
        this.props.setValue(e.target.value);
        this.props.setIncluded(true);
    }

    render() {
        var bounds = '';
        if (this.props.param.minlength !== undefined && this.props.param.maxlength !== undefined) {
            bounds = ` (${this.props.param.minlength} - ${this.props.param.maxlength})`;
        } else if (this.props.param.minlength !== undefined) {
            bounds = ` (min: ${this.props.param.minlength})`;
        } else if (this.props.param.maxlength !== undefined) {
            bounds = ` (max: ${this.props.param.maxlength})`;
        }

        return (<div key={this.props.param.name} className="column_param">
            <div className="column_param_internal">
                    <input className="br2 ba ph2 dark-grey b--grey--light"
                        type="checkbox"
                        checked={this.props.included}
                        onChange={event => { this.props.setIncluded(event.target.checked); }}
                    />
                    <span key="save" className="param_name">{this.props.param.name + bounds}</span>
                </div>
                <input className="br2 ba ph2 dark-grey b--grey--light"
                type="text"
                onChange={this.set}
                style={{ width: "100%" }}
                value={this.props.value}
            />
        </div>);
    }
}

export class EnumParameter extends Parameter {
    constructor(props) {
        super(props);

        this.set = this.set.bind(this);

        var _map = [];
        for (var type in document.apiSpec.enums[props.param.type]) {
            _map.push({ value: document.apiSpec.enums[props.param.type][type] });
        }

        if (!props.value) {
            props.setValue(_map[0].value);
        }

        this.state = {
            map: _map
        }
    }

    set(e) {
        this.props.setValue(e.value);
    }

    render() {
        return (<div key={this.props.param.name} className="basic_param">
                <div className="basic_param_internal">
                    <input className="br2 ba ph2 dark-grey b--grey--light"
                        type="checkbox"
                        checked={this.props.included}
                        onChange={event => { this.props.setIncluded(event.target.checked); }}
                    />
                    <span key="save" className="param_name">{this.props.param.name}</span>
                </div>
                <Select onSelect={this.set} className="__enum"
                    selected={this.props.value ? this.props.value : this.state.map[0]} options={this.state.map} />
            </div>);
    }
}

export class FileParameter extends Parameter {
    constructor(props) {
        super(props);

        this.set = this.set.bind(this);
    }

    set(event) {
        var input = event.target;
        if (!input || !input.files || !input.files[0]) {
            return;
        }

        let fileReader = new FileReader();

        fileReader.onload = (event) => {
            var b64data = event.target.result;
            var characters = atob(b64data.substring(b64data.indexOf(",") + 1));

            const numbers = new Array(characters.length);
            for (let i = 0; i < characters.length; i++) {
                numbers[i] = characters.charCodeAt(i);
            }

            this.props.setValue(new Uint8Array(numbers));
            this.props.setIncluded(true);
        }

        fileReader.readAsDataURL(input.files[0]);
    }

    render() {
        var bounds = '';
        if (this.props.param.minlength !== undefined && this.props.param.maxlength !== undefined) {
            bounds = ` (${this.props.param.minlength} - ${this.props.param.maxlength})`;
        } else if (this.props.param.minlength !== undefined) {
            bounds = ` (min: ${this.props.param.minlength})`;
        } else if (this.props.param.maxlength !== undefined) {
            bounds = ` (max: ${this.props.param.maxlength})`;
        }

        var that = this;
        return (<div key={this.props.param.name} className="basic_param">
                <div className="basic_param_internal">
                    <input className="br2 ba ph2 dark-grey b--grey--light"
                        type="checkbox"
                        checked={this.props.included}
                        onChange={event => { this.props.setIncluded(event.target.checked); }}
                    />
                    <span key="save" className="param_name">{this.props.param.name + bounds}</span>
                </div>
                <input className="ph2 dark-grey choose_file"
                    type="file"
                    onChange={that.set}
                />
            </div>);
    }
}

export class StructParameter extends Parameter {
    constructor(props) {
        super(props);

        this.collapse = this.collapse.bind(this);

        var struct = document.apiSpec.structs[props.param.type];
        struct.sort((a, b) => { 
            if (a.mandatory === 'true' && b.mandatory === 'false') {
                return -1;
            } else if (b.mandatory === 'true' && a.mandatory === 'false') {
                return 1;
            }

            return 0;
        });

        var saved = props.value;

        var params = {};
        for (var param of struct) {
            params[param.name] = {
                mandatory: param.mandatory === 'true',
                included: saved ? saved[param.name] ? true : false : param.mandatory === 'true',
                value: saved ? saved[param.name] : undefined
            }
        }

        this.state = {
            value: saved,
            parameters: params,
            collapsed: true
        }
    }

    collapse() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    setIncluded(paramName, included) {
        var params = this.state.parameters;
        params[paramName].included = included;

        var value = {};
        for (var param in params) {
            if (params[param].included) {
                value[param] = params[param].value;
            }
        }

        this.setState({ parameters: params, value: value });
        this.props.setValue(value);
        if (included) {
            this.props.setIncluded(true);
        }
    }

    setParamValue(paramName, val) {
        var params = this.state.parameters;
        params[paramName].value = val;
        params[paramName].included = true;

        var value = {};
        for (var param in params) {
            if (params[param].included) {
                value[param] = params[param].value;
            }
        }

        this.setState({ parameters: params, value: value });
        this.props.setValue(value);
    }

    render() {
        var structDatas = null;
        var carrot = "<";

        if (this.state.collapsed) {
            var that = this;
            var struct = document.apiSpec.structs[this.props.param.type];
            structDatas = (<div className="param_struct">
                {
                    struct.map(parameter => api2html(that, parameter, this.state.parameters[parameter.name].value))
                }
            </div>);
        }

        return (<div key={this.props.param.name} className="column_param">
            <div className="column_param_internal">
                <input className="br2 ba ph2 dark-grey b--grey--light"
                    type="checkbox"
                    checked={this.props.included}
                    onChange={event => { this.props.setIncluded(event.target.checked); }}
                />
                <span key="save" className="param_name">{this.props.param.name}</span>
                <span onClick={this.collapse} style={{ marginLeft: 'auto' }}>{carrot}</span>
            </div>
            { structDatas }
        </div>);
    }
}

export class ArrayParameter extends Parameter {
    constructor(props) {
        super(props);

        this.addItem = this.addItem.bind(this);

        var parameters = {};
        var values = [];
        if (props.value) {
            props.setIncluded(true);
            for (var elem in props.value) {
                var param = Object.assign({}, props.param);
                param.name += `[${Object.keys(parameters).length}]`;
                delete param.array;

                values.push(props.value[elem]);
                parameters[param.name] = {
                    mandatory: false,
                    included: true,
                    value: props.value[elem]
                };
            }
        }

        this.state = {
            parameters: parameters,
            values: values
        }
    }

    addItem() {
        this.props.setIncluded(true);
        var param = Object.assign({}, this.props.param);
        param.name += `[${Object.keys(this.state.parameters).length}]`;
        delete param.array;

        var params = this.state.parameters;
        params[param.name] = {
            mandatory: false,
            included: true,
            value: undefined
        };

        this.setState({
            parameters: params
        });
    }

    setIncluded(id, included) {
        var params = this.state.parameters;
        params[id].included = included;
        this.setState({ parameters: params });
    }

    setParamValue(id, value) {
        var params = this.state.parameters;
        params[id].value = value;
        params[id].included = true;

        var values = [];
        for (var param in params) {
            if (params[param].included) { values.push(params[param].value) };
        }

        this.setState({ parameters: params, value: values });
        this.props.setValue(values);
    }

    render() {
        var button = "+";
        var that = this;
        var structDatas = (<div className="param_struct">
            { this.state.paramsHtml }
            {
                Object.keys(this.state.parameters).map(parameter => {
                    var param = Object.assign({}, this.props.param);
                    delete param.array;
                    param.name = parameter;
                    return api2html(that, param, this.state.parameters[parameter].value);
                })
            }
        </div>);

        return (<div key={this.props.param.name} className="column_param">
            <div className="column_param_internal">
                <input className="br2 ba ph2 dark-grey b--grey--light"
                    type="checkbox"
                    checked={this.props.included}
                    onChange={event => { this.props.setIncluded(event.target.checked); }}
                />
                <span key="save" className="param_name">{this.props.param.name}</span>
                <span onClick={this.addItem} style={{ marginLeft: 'auto' }}>{button}</span>
            </div>
            { structDatas }
        </div>);
    }
}

export class ImageValueParameter extends EnumParameter {
    
}

export class ImageTypeParameter extends EnumParameter {
    
}

export class ImageParameter extends StructParameter {
    
}

