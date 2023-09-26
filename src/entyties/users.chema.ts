import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, Types } from "mongoose";

@Schema()
export class User {
    @Prop()
    _id:Types.ObjectId
    @Prop()
    id:Types.ObjectId
    @Prop({default: new Date().toISOString()})
    createdAt: string
    @Prop()
    login: string
    @Prop()
    password:string
    @Prop()
    email:string
}

export const usersSchema = SchemaFactory.createForClass(User)

usersSchema.pre('save', function (next) {
    if (!this._id) {
        this._id = this.id = new Types.ObjectId();
      }
      next()
})