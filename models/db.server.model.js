const
    Forum = require("../config/db_schemas/forum.schema"),
    User = require("../config/db_schemas/user.schema"),
    Comment = require("../config/db_schemas/comment.schema");

/**
 * Remove all documents in the database collections
 */
exports.resetCollections = async () => {
    let result;

    try {
        await Forum.deleteMany();
    } catch (err) {
        result = { status: 500, err: err };
    }

    try {
        await User.deleteMany();
    } catch (err) {
        result = { status: 500, err: err };
    }

    try {
        await Comment.deleteMany();
    } catch (err) {
        result = { status: 500, err: err };
    }

    if (!result) {
        result = { status: 200 };
    }
    return result;
}
