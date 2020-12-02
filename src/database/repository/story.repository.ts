import { DocumentType, mongoose } from "@typegoose/typegoose";
import type { IRepositoryPayload } from "src/declarations";

import Model, { Story } from "../entity/story.entity";

export const findOne = async (
   { condition, projection, filter }: Pick<IRepositoryPayload, "condition" | "filter" | "projection">
): Promise<DocumentType<Story>> => {
   try {
      const story = await Model.findOne(condition, projection, filter);

      return story;
   } catch (err) {
      throw new Error(err);
   }
}

export const findById = async (
   { id, projection, filter }: Pick<IRepositoryPayload, "id" | "filter" | "projection">
): Promise<DocumentType<Story>> => {
   try {
      const story = await Model.findById(id, projection, filter);

      return story;
   } catch (err) {
      throw new Error(err);
   }
}

export const find = async (
   { condition, projection, filter }: Pick<IRepositoryPayload, "condition" | "filter" | "projection">
): Promise<DocumentType<Story>[]> => {
   try {
      const stories = await Model.find(condition, projection, filter);

      return stories;
   } catch (err) {
      throw new Error(err);
   }
}

export const create = async (
   { title, content, location, tags, thumbnails, author }: 
   Pick<IRepositoryPayload, "title" | "content" | "thumbnails" | "tags" | "location" | "author">
): Promise<DocumentType<Story>> => {
   try {
      const instance = new Model;
      instance.title = title;
      instance.content = content;
      instance.thumbnails = thumbnails;
      instance.tags = tags;
      instance.location = location;
      instance.author = author;

      const story = await instance.save();

      return story;
   } catch (err) {
      throw new Error(err);
   }
}

export const updateOne = async (
   { condition, query, options }: Pick<IRepositoryPayload, "condition" | "query" | "options">
): Promise<DocumentType<Story>> => {
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
): Promise<Story> => {
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