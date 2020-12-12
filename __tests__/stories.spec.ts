import request from "supertest";
import type { Server } from "http";

import app from "../src/app";

describe("stories", () => {
   let server: Server;

   beforeAll((done) => {
      server = app.listen();
      done();
   });

   afterAll((done) => {
      server.close();
      done();
   });

   it("should fetch stories and return 200 response", async (done) => {

   });
});