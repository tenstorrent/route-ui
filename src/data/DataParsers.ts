export const parseOpDataFormat = (json: JSON): {} => {
    const result = {};
    const fileds = ['logical-core-id', 'op-name', 'op-type', 'output-ops', 'output-queues'];
    Object.entries(json).forEach(([id, obj]) => {
        const o = {inputs: []};
        fileds.forEach((field) => {
            o[field] = obj[field];
        });
        result[id] = o;

        const inputKeysPattern = /^input-idx-\d+$/;
        const inputValuesArray = Object.keys(obj)
            .filter((key) => inputKeysPattern.test(key))
            .map((key) => obj[key]);
        inputValuesArray.map((input) => {
            const inputData = {name: '', type: ''};
            inputData.name = input;
            if (obj['input-queues'].includes(input)) {
                inputData.type = 'que';
            } else {
                inputData.type = 'op';
            }
            o.inputs.push(inputData);
        });
        // console.log(value);
    });
    return result;
};
