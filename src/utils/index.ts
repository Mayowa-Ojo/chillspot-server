import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { find } from "~database/repository/user.repository";
import { config } from "~config/env.config";
import type { IImage } from "~declarations/index";

export const generateUsername = async (
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

export const generateHash = async (password: string): Promise<string> => {
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

export const generateAuthToken = (
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

export const generateProfileImage = (): IImage => {
   const defaultAvatars: IImage[] = [
      { url: "https://chillspot-s3-bucket.s3.us-east-2.amazonaws.com/images/avatar-biking.png", key: "images/avatar-biking.png" },
      { url: "https://chillspot-s3-bucket.s3.us-east-2.amazonaws.com/images/avatar-skiing.png", key: "images/avatar-skiing.png" },
      { url: "https://chillspot-s3-bucket.s3.us-east-2.amazonaws.com/images/avatar-skating.png", key: "images/avatar-skating.png" },
      { url: "https://chillspot-s3-bucket.s3.us-east-2.amazonaws.com/images/avatar-hiking.png", key: "images/avatar-hiking.png" },
      { url: "https://chillspot-s3-bucket.s3.us-east-2.amazonaws.com/images/avatar-snowboarding.png", key: "images/avatar-snowboarding.png" },
      { url: "https://chillspot-s3-bucket.s3.us-east-2.amazonaws.com/images/avatar-snowmobile.png", key: "images/avatar-snowmobile.png" },
   ]

   const randomKey = Math.floor(Math.random()*6);

   return defaultAvatars[randomKey];
}