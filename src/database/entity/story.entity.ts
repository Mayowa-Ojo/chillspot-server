import { Prop, getModelForClass, modelOptions, mongoose, Severity } from "@typegoose/typegoose";

import type { IImage } from "~declarations/index.d";

@modelOptions({ 
   schemaOptions: { timestamps: true, collection: "stories"},
   options: { allowMixed: Severity.ALLOW }
})
export class Story {
   @Prop()
   public title!: string

   @Prop()
   public content!: string

   @Prop({ unique: true })
   public slug!: string

   @Prop()
   public location!: string

   @Prop()
   public thumbnails!: IImage[]

   @Prop({ default: 0 })
   public likes: number

   @Prop({ default: 0})
   public views: number

   @Prop()
   public tags!: string[]

   @Prop()
   public comments: mongoose.Types.ObjectId[]

   @Prop()
   public author!: mongoose.Types.ObjectId
}

const model = getModelForClass(Story);

export default model;
