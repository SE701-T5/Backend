const convict = require('convict');

exports.configParams = convict({
    authToken: {
        format: String,
        default: 'X-Authorization'
    }
});
