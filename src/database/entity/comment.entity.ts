import { Prop, getModelForClass, modelOptions, mongoose, Severity } from "@typegoose/typegoose";

@modelOptions({ 
   schemaOptions: { timestamps: true, collection: "comments"},
   options: { allowMixed: Severity.ALLOW }
})
export class Comment {
   @Prop()
   public content: string

   @Prop()
   public likes: number

   @Prop()
   public dislikes: number

   @Prop()
   public author: mongoose.Types.ObjectId

   @Prop()
   public story: mongoose.Types.ObjectId

   @Prop()
   public replies: mongoose.Types.ObjectId[]
}

const model = getModelForClass(Comment);

export default model;
