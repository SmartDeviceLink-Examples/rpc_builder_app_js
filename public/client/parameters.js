
class Parameter {
    constructor(name, mandatory) {
        this._name = name;
        this._mandatory = mandatory == 'true';
    }

    value = function() {
        return undefined;
    }

    included = function() {
        return this._mandatory || this.pDiv.firstChild.checked;
    }

    setIncluded = function(included) {
        this.pDiv.firstChild.checked = included;
    }

    base_html = function() {
        this.pDiv = document.createElement('div');
        this.pDiv.setAttribute('class', 'rpcParam');

        var includedCheckbox = document.createElement('input');
        includedCheckbox.setAttribute('style', 'flex: 2;');
        includedCheckbox.setAttribute('type', 'checkbox');
        includedCheckbox.setAttribute('id', 'include');
        includedCheckbox.checked = true;

        if (this._mandatory) {
            includedCheckbox.disabled = true;
        }

        this.pDiv.appendChild(includedCheckbox);

        var paramName = document.createElement('p');
        paramName.setAttribute('style', 'flex: 8;');
        paramName.innerHTML = this._name;
        this.pDiv.appendChild(paramName);

        return this.pDiv;
    }

    html = function() {
        var div = this.base_html();

        var infos = document.createElement('p');
        infos.setAttribute('style', 'flex: 4;');
        infos.innerHTML = 'unknown type';

        div.appendChild(infos);

        return div;
    }
}

class BoolParameter extends Parameter {
    constructor(name, mandatory) {
        super(name, mandatory);
    }

    value = function() {
        return this.pDiv.children[2].checked;
    }

    setValue = function(bool) {
        this.pDiv.children[2].checked = bool;
    }

    html = function() {
        var div = this.base_html();

        var valueCheckbox = document.createElement('input');
        valueCheckbox.setAttribute('style', 'flex: 4;');
        valueCheckbox.setAttribute('type', 'checkbox');
        valueCheckbox.checked = true;

        div.appendChild(valueCheckbox);

        return div;
    }
}

class IntParameter extends Parameter {
    constructor(name, mandatory, min, max) {
        super(name, mandatory);
        this._min = min ? parseInt(min) : undefined;
        this._max = max ? parseInt(max) : undefined;
    }

    value = function() {
        return this.pDiv.children[2].valueAsNumber;
    }

    setValue = function(integer) {
        this.pDiv.children[2].valueAsNumber = integer;
    }

    html = function() {
        var div = this.base_html();

        if (this._min !== undefined && this._max !== undefined) {
            div.children[1].innerHTML += ` (${this._min} - ${this._max})`;
        } else if (this._min !== undefined) {
            div.children[1].innerHTML += ` (min: ${this._min})`;
        } else if (this._max !== undefined) {
            div.children[1].innerHTML += ` (max: ${this._max})`;
        }

        var valueInput = document.createElement('input');
        valueInput.setAttribute('style', 'flex: 4;');
        valueInput.setAttribute('type', 'number');

        div.appendChild(valueInput);

        return div;
    }
}

class StringParameter extends Parameter {
    constructor(name, mandatory, min, max) {
        super(name, mandatory);
        this._min = min ? parseInt(min) : undefined;
        this._max = max ? parseInt(max) : undefined;
    }

    value = function() {
        return this.pDiv.children[2].value;
    }

    setValue = function(string) {
        this.pDiv.children[2].value = string;
    }

    html = function() {
        var div = this.base_html();

        if (this._min !== undefined && this._max !== undefined) {
            div.children[1].innerHTML += ` (${this._min} - ${this._max})`;
        } else if (this._min !== undefined) {
            div.children[1].innerHTML += ` (min len: ${this._min})`;
        } else if (this._max !== undefined) {
            div.children[1].innerHTML += ` (max len: ${this._max})`;
        }

        var valueInput = document.createElement('input');
        valueInput.setAttribute('style', 'flex: 4;');
        valueInput.setAttribute('type', 'text');

        div.appendChild(valueInput);

        return div;
    }
}

class EnumParameter extends Parameter {
    constructor(name, mandatory, map) {
        super(name, mandatory);
        this._map = map;
    }

    value = function() {
        return this.pDiv.children[3].value;
    }

    setValue = function(enumVal) {
        this.pDiv.children[3].value = enumVal;
    }

    html = function() {
        var div = this.base_html();

        var datalist = document.createElement('datalist');
        datalist.setAttribute('id', `e_${this._name}`);

        for (var type in this._map) {
            var option = document.createElement('option');
            option.text = this._map[type];
            datalist.appendChild(option);
        }

        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('style', 'flex: 4;');
        input.setAttribute('list', `e_${this._name}`);

        div.appendChild(datalist);
        div.appendChild(input);

        return div;
    }
}

class StructParameter extends Parameter {
    constructor(name, mandatory, type) {
        super(name, mandatory);
        this._type = type;
        this._collapsed = !this._mandatory;

        this.collapse = this.collapse.bind(this);

        this._params = []
        for (var parameter in document.apiSpec.structs[this._type]) {
            this._params.push(createParam(document.apiSpec.structs[this._type][parameter]));
        }

        this._params.sort((a, b) => { 
            if (a._mandatory && !b._mandatory) {
                return -1;
            } else if (b._mandatory && !a._mandatory) {
                return 1;
            }

            return 0;
        });
    }

    collapse = function() {
        this._collapsed = !this._collapsed;
        this._collapseButton.innerHTML = this._collapsed ? 'expand' : 'collapse';

        this.pDiv.children[1].setAttribute('style',
            `display: ${this._collapsed ? 'none' : 'flex'};`);
    }

    value = function() {
        var val = {};
        for (var param of this._params) {
            if (param.included()) {
                val[param._name] = param.value();
            }
        }

        return val;
    }

    setValue = function(object) {
        for (var param of this._params) {
            var savedParam = object[param._name];
            if (savedParam) {
                param.setValue(savedParam);
            } else {
                param.setIncluded(false);
            }
        }
    }

    included = function() {
        return this._mandatory || this.pDiv.firstChild.firstChild.checked;
    }

    setIncluded = function(included) {
        this.pDiv.firstChild.firstChild.checked = included;
    }

    base_html = function() {
        this.pDiv = document.createElement('div');
        this.pDiv.setAttribute('class', 'rpcParamContainer');

        var headerDiv = document.createElement('div');
        headerDiv.setAttribute('class', 'rpcParamChild');

        var includedCheckbox = document.createElement('input');
        includedCheckbox.setAttribute('style', 'flex: 2;');
        includedCheckbox.setAttribute('type', 'checkbox');
        includedCheckbox.setAttribute('id', 'included');
        includedCheckbox.checked = true;

        if (this._mandatory) {
            includedCheckbox.disabled = true;
        }

        headerDiv.appendChild(includedCheckbox);

        var paramName = document.createElement('p');
        paramName.setAttribute('style', 'flex: 8;');
        paramName.innerHTML = `${this._name} (${this._type})`;
        headerDiv.appendChild(paramName);

        this._collapseButton = document.createElement('button');
        this._collapseButton.setAttribute('type', 'button');
        this._collapseButton.setAttribute('style', 'flex: 4;');
        this._collapseButton.onclick = this.collapse;
        this._collapseButton.innerHTML = this._collapsed ? 'expand' : 'collapse';

        headerDiv.appendChild(this._collapseButton);

        this.pDiv.appendChild(headerDiv);

        var sDiv = document.createElement('div');
        sDiv.setAttribute('class', 'rpcParamContainer');

        if (this._collapsed) {
            sDiv.setAttribute('style', 'display: none;');
        }

        this.pDiv.appendChild(sDiv);

        return sDiv;
    }

    html = function() {
        var div = this.base_html();

        for (var param of this._params) {
            div.appendChild(param.html());
        }

        return this.pDiv;
    }
}

class ImageValueParameter extends EnumParameter {
    constructor(name, mandatory, map) {
        super(name, mandatory, map);
        this.typeChange = this.typeChange.bind(this);
    }

    typeChange = function(type) {
        this._type = type;
        if (type === 'STATIC') {
            this.pDiv.children[3].setAttribute('list', `e_${this._name}`);
        } else if (type == 'DYNAMIC') {
            this.pDiv.children[3].removeAttribute('list');
        }
    }
}

class ImageTypeParameter extends EnumParameter {
    constructor(name, mandatory, map, onChangeCallback) {
        super(name, mandatory, map);
        this._cb = onChangeCallback;
    }

    html = function() {
        var div = this.base_html();

        var datalist = document.createElement('datalist');
        datalist.setAttribute('id', `e_${this._name}`);

        for (var type of this._map) {
            var option = document.createElement('option');
            option.text = type;
            datalist.appendChild(option);
        }

        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('style', 'flex: 4;');
        input.setAttribute('list', `e_${this._name}`);

        var that = this;
        input.onchange = function() {
            that._cb(this.value);
        }

        div.appendChild(datalist);
        div.appendChild(input);

        return div;
    }
}

class ImageParameter extends StructParameter {
    constructor(name, mandatory) {
        super(name, mandatory);
        this._type = 'Image';
        this._collapsed = !this._mandatory;

        this.collapse = this.collapse.bind(this);

        var spec = document.apiSpec.structs[this._type][0];
        var valueParam = new ImageValueParameter(spec.name, spec.mandatory, document.staticImageValues);

        spec = document.apiSpec.structs[this._type][1];
        var typeParam = new ImageTypeParameter(spec.name, spec.mandatory, document.apiSpec.enums[spec.type], valueParam.typeChange);

        this._params = [ valueParam, typeParam ]

        for (var parameter of document.apiSpec.structs[this._type]) {
            if (parameter.name === 'value' || parameter.name === 'imageType') { continue; }
            this._params.push(createParam(parameter));
        }
    }
}

class FileParameter extends Parameter {
    constructor(name, mandatory) {
        super(name, mandatory);
    }

    value = function() {
        return document.putFileData;
    }

    setValue = function(data) {
        document.putFileData = new Uint8Array(data);
    }

    included = function() {
        return false;
    }

    html = function() {
        var div = this.base_html();

        div.children[1].setAttribute('style', 'flex: 4;');
        
        var input = document.createElement('input');
        input.setAttribute('style', 'flex: 8;');
        input.setAttribute('type', 'file');

        input.onchange = function() {
            if (!this || !this.files || !this.files[0]) {
                return;
            }

            // should keep flag so rpc send can't be pressed before file is uploaded
            let fileReader = new FileReader();

            fileReader.onload = (event) => {
                var b64data = event.target.result;
                var characters = atob(b64data.substring(b64data.indexOf(",") + 1));

                const numbers = new Array(characters.length);
                for (let i = 0; i < characters.length; i++) {
                    numbers[i] = characters.charCodeAt(i);
                }

                document.putFileData = new Uint8Array(numbers);
            }

            fileReader.readAsDataURL(this.files[0]);
        }

        div.appendChild(input);

        return div;
    }
}

class ArrayParameter extends Parameter {
    constructor(name, mandatory, param, minSize, maxSize) {
        super(name, mandatory);
        this._minSize = minSize;
        this._maxSize = maxSize;

        this._param = Object.assign({}, param);
        this._param.array = undefined;

        this._array = [];

        this.addItem = this.addItem.bind(this);
    }

    addItem = function() {
        var oldName = this._param.name;
        this._param.name = `${this._name} [${this._array.length}]`;
        var newParam = createParam(this._param);
        this._param.name = oldName;
        this._array.push(newParam);
        this.sDiv.appendChild(newParam.html());
    }

    value = function() {
        return this._array.map((param) => param.value())
    }

    setValue = function(array) {
        var oldName = this._param.name;
        for (var elem of array) {
            this._param.name = `${this._name} [${this._array.length}]`;
            var newParam = createParam(this._param);
            this._param.name = this._name;
            this._array.push(newParam);
            this.sDiv.appendChild(newParam.html());
            newParam.setValue(elem);
        }
        this._param.name = oldName;
    }

    included = function() {
        return this._mandatory || this.pDiv.firstChild.firstChild.checked;
    }

    setIncluded = function(included) {
        this.pDiv.firstChild.firstChild.checked = included;
    }

    base_html = function() {
        this.pDiv = document.createElement('div');
        this.pDiv.setAttribute('class', 'rpcParamContainer');

        var headerDiv = document.createElement('div');
        headerDiv.setAttribute('class', 'rpcParamChild');

        var includedCheckbox = document.createElement('input');
        includedCheckbox.setAttribute('style', 'flex: 2;');
        includedCheckbox.setAttribute('type', 'checkbox');
        includedCheckbox.setAttribute('id', 'included');
        includedCheckbox.checked = true;

        if (this._mandatory) {
            includedCheckbox.disabled = true;
        }

        headerDiv.appendChild(includedCheckbox);

        var paramName = document.createElement('p');
        paramName.setAttribute('style', 'flex: 8;');
        let limits = '';
        if (this._minSize !== undefined && this._maxSize !== undefined) {
            limits = ` ${this._minSize} - ${this._maxSize} elems`;
        } else if (this._minSize !== undefined) {
            limits = ` minlength ${this._minSize}`;
        } else if (this._maxSize !== undefined) {
            limits = ` maxlength ${this._maxSize}`;
        }
        paramName.innerHTML = `${this._name} (array${limits})`;
        headerDiv.appendChild(paramName);

        var addItem = document.createElement('button');
        addItem.setAttribute('type', 'button');
        addItem.setAttribute('style', 'flex: 4;');
        addItem.onclick = this.addItem;
        addItem.innerText = "add item";

        headerDiv.appendChild(addItem);

        this.pDiv.appendChild(headerDiv);

        this.sDiv = document.createElement('div');
        this.sDiv.setAttribute('class', 'rpcParamContainer');

        this.pDiv.appendChild(this.sDiv);

        return this.sDiv;
    }

    html = function() {
        var div = this.base_html();

        for (var element of this._array) {
            div.appendChild(element.html());
        }

        return this.pDiv;
    }
}

function createParam(param) {
    if (param.array === 'true') {
        return new ArrayParameter(param.name, param.mandatory, param, param.minsize, param.maxsize);
    }
    else if (param.type === 'Boolean') {
        return new BoolParameter(param.name, param.mandatory);
    }
    else if (param.type === 'Integer') {
        return new IntParameter(param.name, param.mandatory, param.minvalue, param.maxvalue);
    }
    else if (param.type === 'String') {
        return new StringParameter(param.name, param.mandatory, param.minlength, param.maxlength);
    }
    else if (param.type === 'Image') {
        return new ImageParameter(param.name, param.mandatory);
    }
    else if (param.type in document.apiSpec.enums) {
        return new EnumParameter(param.name, param.mandatory, document.apiSpec.enums[param.type]);
    }
    else if (param.type in document.apiSpec.structs) {
        return new StructParameter(param.name, param.mandatory, param.type);
    }

    if (param.name === 'bulkData') {
        return new FileParameter(param.name, param.mandatory);
    }
    
    return new Parameter(param.name, param.mandatory);
}

export default createParam;