import Community from '../config/db_schemas/community.schema';
import Post from '../config/db_schemas/post.schema';
import User from '../config/db_schemas/user.schema';
import Comment from '../config/db_schemas/comment.schema';

/**
 * Remove all documents in the database collections
 */
export async function resetCollections(): Promise<void> {
  await Post.deleteMany();
  await User.deleteMany();
  await Comment.deleteMany();
  await Community.deleteMany();
}
