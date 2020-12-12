import request from "supertest";
import type { Server } from "http";

import app from "../src/app";
import * as userRepository from "~database/repository/user.repository";
import * as utils from "~utils/index";
import { User } from "~database/entity/user.entity";
import type { DocumentType } from "@typegoose/typegoose";

const BASE_URL = "/api/v1/auth";

describe("auth", () => {
   let server: Server;

   beforeAll((done) => {
      server = app.listen();
      done();
   });

   afterAll((done) => {
      server.close();
      done();
   });

   it("should return an authentication error if missing/invalid auth header", async (done) => {

      return request(server)
         .get("/api/v1/stories/feed")
         .expect(401)
         .expect((res) => {
            expect(res.ok).toBe(false);
            done();
         });
   });

   it("should login user and return profile with auth token", async (done) => {
      const payload = {
         email: "jonny@hey.com",
         password: "password"
      }

      const hash = await utils.generateHash(payload.password);

      const expectedResponse = {
         _id: "5fbdcdc5f85a9b5f33903113",
         email: payload.email,
         hash
      }

      const mockFindOne = jest.spyOn(userRepository, "findOne").mockImplementation(() => {
         return Promise.resolve(expectedResponse as DocumentType<User>);
      });

      return request(server)
         .post(`${BASE_URL}/login`)
         .send(payload)
         .expect(200)
         .expect((res) => {
            expect(mockFindOne).toHaveBeenCalled();
            expect(res.ok).toBe(true);
            expect(res.body).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("user");
            expect(res.body.data).toHaveProperty("token");
            done();
         });
   });

   it("should return an unauthorized error response if wrong password is provided", async (done) => {
      const payload = {
         email: "jonny@hey.com",
         password: "password"
      }

      const hash = await utils.generateHash("password123");

      const expectedResponse = {
         _id: "5fbdcdc5f85a9b5f33903113",
         email: payload.email,
         hash
      }

      // create a mock implementaion of <repository.findOne>
      const mockFindOne = jest.spyOn(userRepository, "findOne").mockImplementation(() => {
         return Promise.resolve(expectedResponse as DocumentType<User>);
      });

      return request(server)
         .post(`${BASE_URL}/login`)
         .send(payload)
         .expect(401)
         .expect((res) => {
            expect(mockFindOne).toHaveBeenCalled();
            expect(res.ok).toBe(false);
            expect(res.body).toMatchObject({ok: false, message: "invalid credentials"});
            done();
         });
   });

   it("should return an unauthorized error response if wrong password is provided", async (done) => {
      const payload = {
         email: "jonny@hey.com",
      }

      return request(server)
         .post(`${BASE_URL}/login`)
         .send(payload)
         .expect(412)
         .expect((res) => {
            expect(res.ok).toBe(false);
            expect(res.body).toMatchObject({ok: false, message: "missing/malformed field(s) in request body"});
            done();
         });
   });

   it("should create user and return profile with auth token", async (done) => {
      const payload = {
         firstname: "Sander",
         lastname: "Berge",
         email: "sander.b@hey.com",
         password: "password"
      }

      const { password, ...createdUser } = payload;

      const mockFindOne = jest.spyOn(userRepository, "findOne").mockImplementation(() => {
         return Promise.resolve(null);
      });

      const mockGenerateUsername = jest.spyOn(utils, "generateUsername").mockImplementation();
      const mockGenerateHash = jest.spyOn(utils, "generateHash").mockImplementation();
      const mockGenerateProfileImage = jest.spyOn(utils, "generateProfileImage").mockImplementation();
      const mockGenerateAuthToken = jest.spyOn(utils, "generateAuthToken");
      const mockCreate = jest.spyOn(userRepository, "create").mockImplementation(() => {
         return Promise.resolve({ ...createdUser, _id: "5fbdcdc5f85a9b5f33903113" } as DocumentType<User>);
      });

      return request(server)
         .post(`${BASE_URL}/signup`)
         .send(payload)
         .expect(200)
         .expect((res) => {
            expect(mockFindOne).toHaveBeenCalled();
            expect(mockGenerateUsername).toHaveBeenCalledWith({ firstname: payload.firstname, lastname: payload.lastname });
            expect(mockGenerateHash).toHaveBeenCalledWith(payload.password);
            expect(mockGenerateProfileImage).toHaveBeenCalled();
            expect(mockGenerateAuthToken).toHaveBeenCalledWith({ id: "5fbdcdc5f85a9b5f33903113", email: createdUser.email });
            expect(mockCreate).toHaveBeenCalled();
            expect(res.ok).toBe(true);
            expect(res.body).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("user");
            expect(res.body.data).toHaveProperty("token");
            done();
         });
   });
});