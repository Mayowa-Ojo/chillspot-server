# Chillspot.

> Backend repository for the chillsot web app | [postman documentation]()

### Introduction
Chillspot is a side project I developed for learning purposes. Its design is influenced by [dribbble](https://dribbble.com) and it serves as a platform/community where people can share their travel experiences. This is the backend repository built with koa+typescript and deployed on digital ocean. The [front-end repository](https://github.com/Mayowa-Ojo/chillspot-client) is hosted separately.

### Features
Implemented :heavy_check_mark:
   - Email and password authentication
   - Create stories
   - Like stories
   - Create/edit/delete comments to stories
   - Like/dislike comments
   - Add stories to collection
   - Add stories to archive
   - Follow/unfollow users
   - Follow suggestions
   - Edit profile/Account settings

Roadmap :construction:
   - Social auth [Google/Twitter]
   - Create shareable links to stories
   - Write more extensive test suites

### Development
Requirements
   - Node >=10.x.X
   - MongoDB >= 4.2
   - pm2 [production]
   - nginx [production]
```shell
$ git clone https://github.com/Mayowa-Ojo/chillspot-server.git <folder>
$ npm install
$ touch .env.development # check .env.example for required variables
$ npm start
# running tests
$ npm test
$ npm test -- -t <target> # run only tests that match
```

### Routes
> Refer to the [postman doc]()

### Bug report
If you find any bugs in this app, [open an issue](https://github.com/Mayowa-Ojo/chillspot-server/issues/new)