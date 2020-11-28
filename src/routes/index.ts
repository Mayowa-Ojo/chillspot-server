import Router from "@koa/router";
import multer from "@koa/multer";

import * as authHandler from "~handlers/auth.handler";
import * as storyHandler from "~handlers/story.handler";
import * as userHandler from "~handlers/user.handler";
import * as commentHandler from "~handlers/comment.handler";
import * as imageHandler from "~handlers/image.handler";

const upload = multer({
   limits: {
      fileSize: 5242880
   },
});

const v1Router = new Router();
const storyRouter = new Router({
   prefix: "/stories"
});
const authRouter = new Router({
   prefix: "/auth"
});
const userRouter = new Router({
   prefix: "/users"
});
const commentRouter = new Router({
   prefix: "/comments"
});
const imageRouter = new Router({
   prefix: "/images"
});

// stories router
storyRouter.get("/feed", storyHandler.getFeedForUser);
storyRouter.get("/:id", storyHandler.getStory);
storyRouter.get("/search", storyHandler.searchStories);
storyRouter.patch("/:id/like", storyHandler.likeStory);
storyRouter.patch("/:id/unlike", storyHandler.unlikeStory);
storyRouter.patch("/:id/save", storyHandler.addStoryToCollection);
storyRouter.post("/", storyHandler.createStory);
storyRouter.del("/:id", storyHandler.deleteStory);

// auth router
authRouter.post("/login", authHandler.userLogin);
authRouter.post("/signup", authHandler.userSignup);

// users router
userRouter.get("/:id", userHandler.getUserProfile);
userRouter.get("/:id/followers", userHandler.getFollowersForUser);
userRouter.get("/:id/following", userHandler.getFollowingForUser);
userRouter.patch("/:id/follow", userHandler.followUser);
userRouter.patch("/:id/unfollow", userHandler.unfollowUser);
userRouter.get("/:id/liked-stories", userHandler.getLikedStories);
userRouter.get("/:id/collection", userHandler.getCollectionForUser);
userRouter.get("/:id/stories", userHandler.getStoriesByUser);

// comments router
commentRouter.get("/", commentHandler.getCommentsForStory);
commentRouter.get("/:id", commentHandler.getComment);
commentRouter.post("/", commentHandler.createComment);
commentRouter.patch("/:id/like", commentHandler.likeComment);
commentRouter.patch("/:id/unlike", commentHandler.unlikeComment);
commentRouter.patch("/:id/dislike", commentHandler.dislikeComment);
commentRouter.patch("/:id/undo-dislike", commentHandler.undoDislikeComment);
commentRouter.del("/:id", commentHandler.deleteComment);

// images router
imageRouter.post("/", upload.single("image"), imageHandler.uploadFileToBucket);

v1Router.use("/api/v1", storyRouter.routes(), storyRouter.allowedMethods());
v1Router.use("/api/v1", authRouter.routes(), authRouter.allowedMethods());
v1Router.use("/api/v1", userRouter.routes(), authRouter.allowedMethods());
v1Router.use("/api/v1", commentRouter.routes(), authRouter.allowedMethods());
v1Router.use("/api/v1", imageRouter.routes(), authRouter.allowedMethods());

export { v1Router }