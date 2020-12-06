import { Prop, getModelForClass, modelOptions, mongoose, Severity } from "@typegoose/typegoose";

import type { IImage } from "~declarations/index";

@modelOptions({ 
   schemaOptions: { timestamps: true, collection: "users"},
   options: { allowMixed: Severity.ALLOW }
})
export class User {
   @Prop()
   public firstname!: string

   @Prop()
   public lastname!: string

   @Prop({ unique: true })
   public username!: string

   @Prop()
   public email!: string

   @Prop()
   public hash!: string

   @Prop({ default: "Hi! I'm new to chillspot"})
   public bio: string

   @Prop()
   public avatar: IImage

   @Prop()
   public followers: mongoose.Types.ObjectId[]

   @Prop()
   public following: mongoose.Types.ObjectId[]

   @Prop()
   public collections: mongoose.Types.ObjectId[]

   @Prop()
   public stories: mongoose.Types.ObjectId[]

   @Prop()
   public likes: mongoose.Types.ObjectId[]

   @Prop()
   public archive: mongoose.Types.ObjectId[]
}

const model = getModelForClass(User);

export default model;
