import Forum from '../config/db_schemas/post.schema';
import User from '../config/db_schemas/user.schema';
import Comment from '../config/db_schemas/comment.schema';
import { ServerError } from '../lib/utils.lib';

/**
 * Remove all documents in the database collections
 */
export async function resetCollections(): Promise<void> {
  try {
    await Forum.deleteMany();
  } catch (err) {
    throw new ServerError('unexpected error', 500, err);
  }

  try {
    await User.deleteMany();
  } catch (err) {
    throw new ServerError('unexpected error', 500, err);
  }

  try {
    await Comment.deleteMany();
  } catch (err) {
    throw new ServerError('unexpected error', 500, err);
  }
}
