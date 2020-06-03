function getApiSpec(callback, branch = 'master', remote = 'smartdevicelink') {
    fetch(`https://raw.githubusercontent.com/${remote}/rpc_spec/${branch}/MOBILE_API.xml`).then((res) => res.text()).then((xml) => {
        var xml2json = function(node) {
            if (node.nodeName === 'struct' || (node.nodeName === 'function' && node.attributes && node.attributes.messagetype 
                 && node.attributes.messagetype.nodeValue === 'request')) {
                    document.apiSpec[node.nodeName + 's'][node.attributes.name.nodeValue] = 
                        [...node.childNodes].filter(x => x.tagName === 'param').map(child => {
                            var param = {};
                            for (var attrib of child.attributes) {
                                param[attrib.nodeName] = attrib.nodeValue;
                            }
                            return param;
                        });
            } else if (node.nodeName === 'enum') {
                document.apiSpec.enums[node.attributes.name.nodeValue] = 
                    [...node.childNodes].filter(child => child.tagName === 'element').map(element => {
                        return element.attributes.name.nodeValue;
                    })
            } else {
                for (var child of node.childNodes) {
                    xml2json(child);
                }
            }
        }

        document.apiSpec = {
            functions: {},
            enums: {},
            structs: {}
        }

        xml2json((new DOMParser()).parseFromString(xml, "text/xml"));
        console.log(`api spec ${remote}/${branch} has been loaded`);

        if (callback) { callback(); }
    });
}

export { getApiSpec };