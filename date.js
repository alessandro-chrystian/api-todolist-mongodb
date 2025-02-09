exports.getDate = () => {
    const today = new Date();

    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return today.toLocaleDateString('en-US', options)
}

exports.getDay = () => {
    const today = new Date();

    const options = {weekday: 'long'};

    return today.toLocaleDateString('en-US', options)
}

console.log(module.exports)