import convict from 'convict';

export const configParams = convict({
    authToken: {
        format: String,
        default: 'X-Authorization'
    }
});
