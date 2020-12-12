import { generateHash, verifyPassword } from "~utils/index";

describe("generate password hash and verify", () => {
   it("should hash password and validate that it is correct", async (): Promise<void> => {
      const password = "secret123";
      const hash = await generateHash(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
   });
});
