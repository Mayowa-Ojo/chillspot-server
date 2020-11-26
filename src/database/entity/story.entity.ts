import { Prop, getModelForClass, modelOptions, mongoose, Severity } from "@typegoose/typegoose";

@modelOptions({ 
   schemaOptions: { timestamps: true, collection: "stories"},
   options: { allowMixed: Severity.ALLOW }
})
export class Story {
   @Prop()
   public title: string

   @Prop()
   public content: string

   @Prop()
   public location: string

   @Prop()
   public thumbnails: string[]

   @Prop()
   public likes: number

   @Prop()
   public views: number

   @Prop()
   public tags: string[]

   @Prop()
   public comments: mongoose.Types.ObjectId[]

   @Prop()
   public author: mongoose.Types.ObjectId
}

const model = getModelForClass(Story);

export default model;
