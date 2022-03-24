import Forum from "../config/db_schemas/forum.schema";
import User from "../config/db_schemas/user.schema";
import Comment from "../config/db_schemas/comment.schema";

/**
 * Remove all documents in the database collections
 */
export async function resetCollections() {
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
