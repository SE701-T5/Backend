import mongoose, { Schema, HydratedDocument } from 'mongoose';

export interface ICommunity {
  name: string;
  description: string;
  members: number;
  img: string;
}

const communitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    description: {
      type: String,
      required: true,
    },
    members: {
      type: Number,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type CommunityDocument = HydratedDocument<ICommunity>;

const CommunityModel = mongoose.model<ICommunity>('Community', communitySchema);
export default CommunityModel;
