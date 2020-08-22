const FormData = require("form-data");

const fileConfig = (fileBuffer, name) => {
  const formData = new FormData();
  formData.append("image", fileBuffer);
  formData.append("name", name);
  const config = {
    url: "https://api.imgur.com/3/image",
    method: "post",
    headers: {
      Authorization: `Bearer ${process.env.BEARER}`,
      ...formData.getHeaders(),
    },
    data: formData,
  };
  return config;
};

module.exports = fileConfig;
