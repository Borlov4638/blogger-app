import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, HydratedDocument, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  _id: Types.ObjectId;
  @Prop()
  id: Types.ObjectId;
  @Prop()
  createdAt: string;
  @Prop()
  login: string;
  @Prop()
  password: string;
  @Prop()
  email: string;
  @Prop({type:{confirmationCode:String, expirationDate: Number, isConfirmed:Boolean},
    default:{ isConfirmed:false}, _id:false
  })
  emailConfirmation:{
    confirmationCode:string,
    expirationDate:number,
    isConfirmed:boolean
  }
  confirm : Function
  newConfirmationCode:Function
}

export const usersSchema = SchemaFactory.createForClass(User);

usersSchema.methods.confirm = function (){
  this.emailConfirmation.isConfirmed=true
}

usersSchema.methods.newConfirmationCode = function (){
  return this.emailConfirmation.confirmationCode = uuidv4()
}

usersSchema.pre('save', function (next) {
  if(!this.emailConfirmation.expirationDate){
    this.emailConfirmation.expirationDate = +new Date()+1800000
  }
  if(!this.emailConfirmation.confirmationCode){
    this.emailConfirmation.confirmationCode = uuidv4()
  }
  if (!this.createdAt) {
    this.createdAt = new Date().toISOString();
  }
  if (!this._id) {
    this._id = this.id = new Types.ObjectId();
  }
  next();
});
