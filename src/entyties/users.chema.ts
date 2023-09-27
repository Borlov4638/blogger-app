import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument, Types } from "mongoose";


export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
    @Prop()
    _id:Types.ObjectId
    @Prop()
    id:Types.ObjectId
    @Prop()
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
    if(!this.createdAt){
        this.createdAt = new Date().toISOString()
    }
    if (!this._id) {
        this._id = this.id = new Types.ObjectId();
      }
      next()
})