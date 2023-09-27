import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument, ObjectId, Types } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop()
  _id: Types.ObjectId;
  @Prop()
  id: Types.ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop()
  createdAt: string;
  @Prop({ required: true, default: false })
  isMembership: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = new Date().toISOString();
  }
  if (!this._id) {
    this._id = this.id = new Types.ObjectId();
  }
  next();
});
