const express = require("express");
const multer = require("multer");
const { validationResult } = require("express-validator");
const { userModel, tweetModel, commentModel } = require("./schema");
const { reqIsValidate } = require("./validator");
const { uploadImage, deleteImage } = require("./imgurApi");

const router = express.Router();

const regex = /\.(jpg||jpeg||png||gif||mp4)$/;

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(regex)) {
      const error = new Error("Please upload correct file format");
      cb(error, false);
    } else {
      cb(null, true);
    }
  },
});

// user information validation middleware
router.use("/home", reqIsValidate, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg);
    next(err);
  }
  next();
});

// tweet validation middleware
// router.use("/post/tweet", tweetIsValidate, (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const err = new Error(errors.array()[0].msg);
//     next(err);
//   }
//   next();
// });

// login
router.post("/home/login", (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };

  userModel.exists(user, (err, result) => {
    if (result) {
      res.status(200).json({ message: "Success" });
    } else {
      res.status(404).json({ message: "Incorrect username or password" });
    }
  });
});

// register
router.post("/home/register", async (req, res) => {
  const email = await userModel.findOne({ email: req.body.email }).exec();
  if (email) return res.status(400).json({ message: "Email is already exist" });
  else {
    const user = await userModel
      .findOne({ username: req.body.username })
      .exec();
    if (user)
      return res.status(400).json({ message: "Username is already exist" });
  }
  const newUser = new userModel({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });
  console.log(req.body);
  userModel.create(newUser, (err) => {
    try {
      if (err && err.code === 11000) throw err;
      res.status(200).json({ message: "Data is saved" });
    } catch (err) {
      console.log(err);
      const field = Object.keys(err.keyPattern).toString();
      const message = `${field.replace(
        field[0],
        field[0].toUpperCase()
      )} is already exist.`;
      res.status(400).json({ message: message });
    }
  });
});

// image handler
// router.post("/home/upload", upload.array("image", 5), async (req, res) => {
//   const promises = req.files.map((file) => {
//     const fileBuffer = file.buffer.toString("base64");
//     const config = fileConfig(fileBuffer);
//     return axios(config);
//   });
//   const links = (await Promise.all(promises)).map((response) => {
//     try {
//       return response.data.data.link;
//     } catch (err) {
//       return err.message;
//     }
//   });
//   res.json({ message: links });
// });

// update user information
router.put("/home/update", async (req, res) => {
  const userInfo = {
    username: req.body.username,
    password: req.body.password,
  };
  userModel.findOne(userInfo, async (err, user) => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = req.body.newPassword;
    await user.save(
      { validateBeforeSave: true, validateModifiedOnly: true },
      (err, user) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        res.status(200).json({ message: `${user.username} is updated` });
      }
    );
  });
});

// delete account
router.delete("/home/delete", async (req, res) => {
  userInfo = {
    username: req.body.username,
    password: req.body.password,
  };
  userModel.findOneAndDelete(userInfo, (err, user) => {
    if (err) return res.status(400).json({ message: "User not found" });
    res.status(200).json({ message: "Account is deleted" });
  });
});

// get all tweets
router.post("/get/tweets", async (req, res) => {
  const tweets = (await tweetModel.find({})).reverse();
  const returnTweets = tweets.slice(
    req.body.page * 5,
    parseInt(req.body.page + 1) * 5
  );
  if (returnTweets.length === 0) {
    return res
      .status(304)
      .json({ message: "There are no more tweets in the database" });
  }
  return res.status(200).json({ tweets: returnTweets });
});

router.post("/get/comments", async (req, res) => {
  const { replyTweetId, page } = req.body;
  const comments = await (
    await commentModel.find({ replyTweetId: replyTweetId })
  ).reverse();
  const returnComments = comments.slice(page * 5, parseInt(page + 1) * 5);
  if (returnComments.length === 0) {
    return res
      .status(304)
      .json({ message: "There are no more comments of this tweet" });
  }
  return res.status(200).json({ comments: returnComments });
});

// tweets posting
router.post("/post/tweet", upload.array("image", 4), async (req, res) => {
  const tweet = await uploadImage(req);
  tweetModel.create(tweet);
  res.status(200).json({ message: "Data is saved", tweet: tweet });
});

// update tweets like
router.put("/like/tweet", async (req, res) => {
  const { id, data, liked } = req.body;
  console.log(req.body);
  if (!liked) {
    tweetModel.findByIdAndUpdate(id, { $inc: { [data]: 1 } }).exec();
  } else {
    tweetModel.findByIdAndUpdate(id, { $inc: { [data]: -1 } }).exec();
  }
});

// update tweets comments and save to comment database
router.put("/comment/tweet", upload.array("image", 4), async (req, res) => {
  const id = req.body.replyTweetId;
  console.log(id);
  tweetModel.findByIdAndUpdate(id, { $inc: { comment: 1 } }).exec();
  var commentTweet = await uploadImage(req);
  commentTweet.replyTweetId = id;
  commentModel.create(commentTweet);
  res.status(200).json({ comment: commentTweet });
});

// tweets deleting
router.delete("/delete/tweet", async (req, res) => {
  // const id = req.body.id;
  const tweets = await tweetModel.find({}, "_id").exec();
  if (tweets.length == 0)
    return res.status(404).json({ message: "There are no tweets" });
  const id = tweets[0]._id;
  deleteImage(id, res);
});

// error handler middleware
router.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

module.exports = router;
