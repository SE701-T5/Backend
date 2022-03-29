import Community from '../config/db_schemas/community.schema';

export function insertCommunity(params, done) {
  // Set Community attributes
  const name = params.name,
    description = params.description,
    members = params.members,
    img = params.img;

  // Create new Community document
  const newCommunity = new Community({
    name,
    description,
    members,
    img,
  });

  // Save new Community document to database collection
  newCommunity
    .save()
    .then((res) => {
      return done(res);
    })
    .catch((err) => {
      // Community is already in the database with unique attributes, return duplicate conflict error
      if (err.code === 11000) {
        return done({ err: 'Conflict', status: 409 });
      }
      // Any other database error, return internal server error
      return done({ err: 'Internal server error', status: 500 });
    });
}

export function updateCommunityById(CommunityID, params, done) {
  // Set Community attributes
  const name = params.name,
    description = params.description,
    members = params.members,
    img = params.img;

  // Create new Community document
  const newCommunity = new Community({
    name,
    description,
    members,
    img,
  });

  try {
    Community.findOneAndUpdate(
      { _id: CommunityID },
      { $set: params },
      { new: true },
    )
      .then((res) => {
        return res
          ? done({ status: 200, res })
          : done({ err: 'Not found', status: 404 });
      })
      .catch((err) => {
        return done({ err: 'Not found', status: 404 });
      });
  } catch (err) {
    return done({ err: 'Internal server error', status: 500 });
  }
}
