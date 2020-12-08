import { Prop, getModelForClass, modelOptions, mongoose, Severity } from "@typegoose/typegoose";

@modelOptions({ 
   schemaOptions: { timestamps: true, collection: "comments"},
   options: { allowMixed: Severity.ALLOW }
})
export class Comment {
   @Prop()
   public content!: string

   @Prop({ default: 0 })
   public likes: number

   @Prop({ default: 0 })
   public dislikes: number

   @Prop({ default: 0 })
   public likedBy: [mongoose.Types.ObjectId]

   @Prop({ default: 0 })
   public dislikedBy: [mongoose.Types.ObjectId]

   @Prop()
   public author!: mongoose.Types.ObjectId

   @Prop()
   public story!: mongoose.Types.ObjectId

   @Prop()
   public replies: mongoose.Types.ObjectId[]
}

const model = getModelForClass(Comment);

export default model;
