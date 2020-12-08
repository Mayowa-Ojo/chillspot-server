import { DocumentType, mongoose } from "@typegoose/typegoose";

import Model, { Comment } from "~database/entity/comment.entity";
import type { IAggregationStage, IRepositoryPayload } from "~declarations/index.d";

export const findOne = async (
   { condition, projection, filter }: Pick<IRepositoryPayload, "condition" | "filter" | "projection">
): Promise<DocumentType<Comment>> => {
   try {
      const comment = await Model.findOne(condition, projection, filter);

      return comment;
   } catch (err) {
      throw err;
   }
}

export const findById = async (
   { id, projection, filter }: Pick<IRepositoryPayload, "id" | "filter" | "projection">
): Promise<DocumentType<Comment>> => {
   try {
      const comment = await Model.findById(id, projection, filter);

      return comment;
   } catch (err) {
      throw err;
   }
}

export const find = async (
   { condition, projection, filter }: Pick<IRepositoryPayload, "condition" | "filter" | "projection">
): Promise<DocumentType<Comment>[]> => {
   try {
      const comments = await Model.find(condition, projection, filter);

      return comments;
   } catch (err) {
      throw err;
   }
}

export const create = async (
   { content, author, story }: Pick<IRepositoryPayload, "content" | "author" | "story">
): Promise<DocumentType<Comment>> => {
   try {
      const instance = new Model;
      instance.content = content;
      instance.author = author;
      instance.story = story;

      const comment = await instance.save();

      return comment;
   } catch (err) {
      throw err;
   }
}

export const updateOne = async (
   { condition, query, options }: Pick<IRepositoryPayload, "condition" | "query" | "options">
): Promise<DocumentType<Comment>> => {
   try {
      const result = Model.findOneAndUpdate(
         condition,
         query,
         { ...options, new: true, useFindAndModify: false }
      );

      return result;
   } catch (err) {
      throw new Error(err);
   }
}

export const deleteOne = async (
   { condition }: Pick<IRepositoryPayload, "condition">
): Promise<DocumentType<Comment>> => {
   try {
      const result = Model.findOneAndDelete(condition);

      return result;
   } catch (err) {
      throw new Error(err);
   }
}

export const deleteMany = async (
   { condition }: Pick<IRepositoryPayload, "condition">
): Promise<mongoose.Query<{}>> => {
   try {
      const result = Model.deleteMany(condition);

      return result;
   } catch (err) {
      throw new Error(err);
   }
}

export const buildAggregationPipeline = async (
   pipeline: IAggregationStage[]
): Promise<DocumentType<Comment>[]> => {
   try {
      const result = await Model.aggregate(pipeline);

      return result;
   } catch (err) {
      throw new Error(err);
   }
}