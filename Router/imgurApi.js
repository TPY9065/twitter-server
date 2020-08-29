const fileConfig = require("./config");
const axios = require("axios");
const { tweetModel } = require("./schema");

const uploadImage = async (req) => {
  var links = {};
  if (req.files != undefined) {
    const promises = [];
    req.files.map((file) => {
      const fileBuffer = file.buffer.toString("base64");
      const config = fileConfig(fileBuffer, file.originalname);
      promises.push(axios(config));
    });
    (await Promise.all(promises)).map((response) => {
      try {
        const id = response.data.data.id;
        const url = response.data.data.link;
        links[id] = url;
      } catch (err) {
        return err.message;
      }
    });
  }
  var empty = true;
  for (var f in links) {
    empty = false;
  }
  if (empty) {
    links = null;
  }
  const tweet = {
    text: req.body.text,
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
