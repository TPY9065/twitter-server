const fileConfig = require("./config");
const axios = require("axios");
const { tweetModel } = require("./schema");

const uploadImage = async (req) => {
  const promises = req.files.map((file) => {
    const fileBuffer = file.buffer.toString("base64");
    const config = fileConfig(fileBuffer, file.originalname);
    return axios(config);
  });
  const links = {};
  (await Promise.all(promises)).forEach((response) => {
    try {
      const id = response.data.data.id;
      const url = response.data.data.link;
      const imageInfo = { [id]: url };
      Object.assign(links, imageInfo);
    } catch (err) {
      return err.message;
    }
  });
  const tweet = {
    text: req.body.text,
    userIcon: "123",
    username: req.body.username,
    media: links,
    comment: 0,
    retweets: 0,
    like: 0,
    time: new Date().toLocaleString("ch", { hour12: false }),
  };
  return tweet;
};

const deleteImage = (id, res) => {
  tweetModel.findByIdAndDelete(id, async (err, doc) => {
    if (!doc) return res.status(404).json({ message: "Tweet not found" });
    try {
      const promises = Object.keys(doc.media[0]).map((imageHash) => {
        const config = {
          url: `https://api.imgur.com/3/image/${imageHash}`,
          method: "delete",
          headers: {
            Authorization: `Bearer ${process.env.BEARER}`,
          },
        };
        return axios(config);
      });
      Promise.all(promises).then((value) => {
        return res.status(200).json({ message: "Tweet is deleted" });
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  });
};

module.exports = { uploadImage, deleteImage };
