import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { find } from "~database/repository/user.repository";
import { config } from "~config/env.config";

export const GenerateUsername = async (
   name: { firstname: string, lastname: string }
): Promise<string> => {
   if(!name.firstname || !name.lastname) {
      throw new Error("missing parameters");
   }

   const { firstname, lastname } = name;

   const users = await find({
      condition: {
         $and: [
            { firstname },
            { lastname }
         ]
      },
      projection: null,
      filter: {}
   });

   const matches = users.length;

   if(matches < 1) {
      return `${firstname}-${lastname}`;
   }

   return `${firstname}-${lastname}-${matches}`;
}

export const GenerateHash = async (password: string): Promise<string> => {
   try {
      const hash = await bcrypt.hash(password, 10);

      return hash;
   } catch (err) {
      throw err;
   }
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
   try {
      const isValid = await bcrypt.compare(password, hash);

      return isValid;
   } catch (err) {
      throw err;
   }
}

export const GenerateAuthToken = (
   payload: { id: string, email: string}
): string => {
   const options: jwt.SignOptions = {
      expiresIn: "7d"
   }

   const token = jwt.sign(payload, config.JWT_SECRET, options);

   return token;
}

export const verifyAuthToken = (token: string): string | object => {
   try {
      const isValid = jwt.verify(token, config.JWT_SECRET);

      return isValid;
   } catch (err) {
      throw err;
   }
}