import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SessionDocument = HydratedDocument<Session> 

@Schema()
export class Session{
    @Prop()
    userId:Types.ObjectId
    @Prop()
    ip:string
    @Prop()
    title:string
    @Prop()
    lastActiveDate:string
    @Prop()
    deviceId:string
    @Prop()
    expiration:string
}

export const sessionSchema = SchemaFactory.createForClass(Session)