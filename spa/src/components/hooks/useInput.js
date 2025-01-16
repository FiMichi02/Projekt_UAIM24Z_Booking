import { useState } from 'react';

const UseInput = initialValue => {
    const [value, setValue] = useState(initialValue);

    return [
        {value, onChange: e => setValue(e.target.value)},
        () => setValue(initialValue)
    ];
};

export default UseInput;