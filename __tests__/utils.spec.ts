import { generateHash, verifyPassword, generateUsername } from "~utils/index";
import * as userRepository from "~database/repository/user.repository";

describe("utils", () => {
   it("should hash password and validate that it is correct", async (): Promise<void> => {
      const password = "secret123";
      const hash = await generateHash(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
   });

   it("should generate unique username", async (): Promise<void> => {
      const payload = {
         firstname: "Derek",
         lastname: "Thompson"
      }

      const mockFind = jest.spyOn(userRepository, "find").mockImplementation(() => {
         return Promise.resolve(Array(2).fill({}));
      });

      const username = await generateUsername(payload);

      expect(username).toBe("Derek-Thompson-2");
      expect(mockFind).toHaveBeenCalled();
   });
});
