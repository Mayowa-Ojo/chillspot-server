import { DocumentType, mongoose } from "@typegoose/typegoose";
import type { IRepositoryPayload } from "src/declarations";

import Model, { Comment } from "../entity/comment.entity";

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
   { content, author }: Pick<IRepositoryPayload, "content" | "author">
): Promise<DocumentType<Comment>> => {
   try {
      const instance = new Model;
      instance.content = content;
      instance.author = author;

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