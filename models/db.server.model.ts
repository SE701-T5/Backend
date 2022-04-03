import faker, { GenderType } from '@faker-js/faker';
import * as Crypto from 'crypto';
import Community, {
  CommunityDocument,
} from '../config/db_schemas/community.schema';
import Post, { PostDocument } from '../config/db_schemas/post.schema';
import User, { UserDocument } from '../config/db_schemas/user.schema';
import * as UserUtils from '../models/user.server.model';
import Comment, { CommentDocument } from '../config/db_schemas/comment.schema';

export interface ResampleDTO {
  users?: number;
  communities?: number;
  posts?: number | [number, number];
  comments?: number | [number, number];
}

export interface ResampleCounts {
  communities: number;
  users: number;
  posts: number;
  comments: number;
}

/**
 * Remove all documents in the database collections
 */
export async function resetCollections(): Promise<void> {
  await Post.deleteMany();
  await User.deleteMany();
  await Comment.deleteMany();
  await Community.deleteMany();
}

export async function generateFakeData(
  counts: ResampleDTO,
): Promise<ResampleCounts> {
  const users: UserDocument[] = [];
  const communities: CommunityDocument[] = [];
  const posts: PostDocument[] = [];
  const comments: CommentDocument[] = [];

  // Generate Users
  for (let i = 0; i < counts.users; i++) {
    const gender = faker.name.gender(true) as GenderType;
    const firstName = faker.name.firstName(gender);
    const lastName = faker.name.lastName(gender);

    const password = UserUtils.hashPassword('Password@123');

    users.push(
      new User({
        email: faker.internet.email(firstName, lastName),
        username: faker.internet.userName(firstName, lastName),
        displayName: faker.name.findName(firstName, lastName),
        hashedPassword: password.hash,
        salt: password.salt,
        profilePicture: 'https://source.unsplash.com/random/1920x1080',
      }),
    );
  }

  // Generate Communities
  for (let i = 0; i < counts.communities; i++) {
    const community = new Community({
      name:
        faker.random.arrayElement([
          'SOFTENG',
          'ENGSCI',
          'ELECTENG',
          'ENGGEN',
          'COMPSCI',
        ]) + Crypto.randomInt(0, 999).toString().padStart(3, '0'),
      description: faker.commerce.productDescription(),
      img: 'https://source.unsplash.com/random/1920x1080',
      owner: faker.random.arrayElement(users)._id,
    });
    communities.push(community);

    // Generate Posts
    const postCount =
      typeof counts.posts === 'number'
        ? counts.posts
        : Crypto.randomInt(counts.posts[0], counts.posts[1] + 1);
    for (let j = 0; j < postCount; j++) {
      const post = new Post({
        title: faker.company.bs(),
        upVotes: Crypto.randomInt(0, 100),
        downVotes: Crypto.randomInt(0, 100),
        attachments: faker.random.arrayElements(
          [
            'https://source.unsplash.com/random/1920x1080',
            'https://source.unsplash.com/random/1920x1080',
            'https://source.unsplash.com/random/1920x1080',
          ],
          Crypto.randomInt(0, 4),
        ),
        community: community._id,
        owner: faker.random.arrayElement(users)._id,
        bodyText: faker.lorem.sentence(),
        comments: [],
        edited: false,
      });
      posts.push(post);

      // Generate Comments
      const commentCount =
        typeof counts.comments === 'number'
          ? counts.comments
          : Crypto.randomInt(counts.comments[0], counts.comments[1] + 1);
      for (let k = 0; k < commentCount; k++) {
        const comment = new Comment({
          owner: faker.random.arrayElement(users)._id,
          edited: false,
          attachments: faker.random.arrayElements(
            [
              'https://source.unsplash.com/random/1920x1080',
              'https://source.unsplash.com/random/1920x1080',
              'https://source.unsplash.com/random/1920x1080',
            ],
            Crypto.randomInt(0, 4),
          ),
          upVotes: Crypto.randomInt(0, 100),
          downVotes: Crypto.randomInt(0, 100),
          bodyText: faker.hacker.phrase(),
        });
        comments.push(comment);
        post.comments.push(comment._id);
      }
    }
  }

  // Subscribe Users to Communities
  for (const user of users) {
    const subscribeCount = Crypto.randomInt(communities.length);
    const communitiesToSubscribe = faker.random.arrayElements(
      communities,
      subscribeCount,
    );
    for (const community of communitiesToSubscribe) {
      user.subscribedCommunities.push(community._id);
    }
  }

  // Save All to DB
  await Promise.all([
    User.insertMany(users),
    Community.insertMany(communities),
    Post.insertMany(posts),
    Comment.insertMany(comments),
  ]);

  return {
    communities: communities.length,
    users: users.length,
    comments: comments.length,
    posts: posts.length,
  };
}
