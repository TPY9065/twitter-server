const mongoose = require("mongoose");

// database validation
const Schema = mongoose.Schema;

const requiredData = {
  type: String,
  required: true,
};

const userSchema = new Schema({
  email: requiredData,
  username: requiredData,
  password: requiredData,
});

const tweetSchema = new Schema({
  text: String,
  userIcon: String,
  username: String,
  media: Array,
  comment: Number,
  retweets: Number,
  like: Number,
  time: String,
});

const commentSchema = new Schema({
  replyTweetId: String,
  text: String,
  userIcon: String,
  username: String,
  media: Array,
  comment: Number,
  retweets: Number,
  like: Number,
  time: String,
});

const userModel = mongoose.model("userModel", userSchema);
const tweetModel = mongoose.model("tweetModel", tweetSchema);
const commentModel = mongoose.model("CommentModel", commentSchema);

module.exports = { userModel, tweetModel, commentModel };
