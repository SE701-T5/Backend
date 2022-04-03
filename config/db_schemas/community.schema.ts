import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { TimestampedModel } from '../../lib/utils.lib';

export interface ICommunity extends TimestampedModel {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  img?: string;
}

const communitySchema = new Schema<ICommunity>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    description: {
      type: String,
      required: true,
      default: '',
    },
    img: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export type CommunityDocument = HydratedDocument<ICommunity>;

const CommunityModel = mongoose.model<ICommunity>('Community', communitySchema);
export default CommunityModel;
