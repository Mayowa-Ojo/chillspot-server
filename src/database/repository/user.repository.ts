import { DocumentType, mongoose } from "@typegoose/typegoose";
import type { IAggregationStage, IRepositoryPayload } from "src/declarations";

import Model, { User } from "../entity/user.entity";

export const findOne = async (
   { condition, projection, filter }: Pick<IRepositoryPayload, "condition" | "filter" | "projection">
): Promise<DocumentType<User>> => {
   try {
      const user = await Model.findOne(condition, projection, filter);

      return user;
   } catch (err) {
      throw err;
   }
}

export const findById = async (
   { id, projection, filter }: Pick<IRepositoryPayload, "id" | "filter" | "projection">
): Promise<DocumentType<User>> => {
   try {
      const user = await Model.findById(id, projection, filter);

      return user;
   } catch (err) {
      throw err;
   }
}

export const find = async (
   { condition, projection, filter }: Pick<IRepositoryPayload, "condition" | "filter" | "projection">
): Promise<DocumentType<User>[]> => {
   try {
      const users = await Model.find(condition, projection, filter);

      return users;
   } catch (err) {
      throw err;
   }
}

export const create = async (
   { firstname, lastname, username, email, hash, avatar }: Pick<IRepositoryPayload, "firstname" | "lastname" | "username" | "email" | "hash" | "avatar">
): Promise<DocumentType<User>> => {
   try {
      const instance = new Model;
      instance.firstname = firstname;
      instance.lastname = lastname;
      instance.username = username;
      instance.email = email;
      instance.hash = hash;
      instance.avatar = avatar;

      const user = await instance.save();

      return user;
   } catch (err) {
      throw err;
   }
}

export const updateOne = async (
   { condition, query, options }: Pick<IRepositoryPayload, "condition" | "query" | "options">
): Promise<DocumentType<User>> => {
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
   { id }: Pick<IRepositoryPayload, "id">
): Promise<DocumentType<User>> => {
   try {
      const result = Model.findOneAndDelete({
         _id: id
      });

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
): Promise<DocumentType<User>[]> => {
   try {
      const result = await Model.aggregate(pipeline);

      return result;
   } catch (err) {
      throw new Error(err);
   }
}