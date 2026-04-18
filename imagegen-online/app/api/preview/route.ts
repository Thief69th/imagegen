const { platformInfo } = require('./platformInfo');

const previewRoute = (request, response) => {
    // ... other code

    const displayName = platformInfo.label; // Updated this line

    // ... other code
};

module.exports = previewRoute;