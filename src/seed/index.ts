import { IRepositoryPayload } from "~declarations/index";
import { castToObjectId, slugify } from "~utils/index";
import { insertMany } from "../database/repository/story.repository";
import seed from "./seed.json";

export const seedStories = async () => {
   try {
      const documents = seed.stories.map(story => ({...story, author: castToObjectId(story.author)}));
      documents.forEach(doc => {
         doc['slug'] = slugify(doc.title);
      });

      const result = await insertMany(
         documents as unknown as Pick<IRepositoryPayload, "title" | "content" | "thumbnails" | "tags" | "location" | "author" | "slug">[]
      );

      console.log(`[INFO] --seed: result: \n`, result);
   } catch (err) {
      console.error(`[ERROR] --seeding: \n`, err)
   }
}

// export const seedComments = () => {

// }