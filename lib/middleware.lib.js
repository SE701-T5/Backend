const
    User = require("../models/user.server.model"),
    { configParams } = require("../config/config.server.config");

/**
 * Verify if an authorization token exists in the database at API gateway to determine whether to continue or not
 * @param req HTTP request object containing the authorization token for verification
 * @param res HTTP request response status code with message if the verification fails
 * @param next continue to the next function if the status code returned from authorization token verification is 200
 */
exports.isRequestTokenAuthorized = function(req, res, next) {
    const authToken = req.get(configParams.get('authToken'));
    User.searchUserByAuthToken(authToken, function (result) {
        if (result.status !== 200) {
            return res.sendStatus(result.status).message(result.message);
        }
        next();
    });
}
