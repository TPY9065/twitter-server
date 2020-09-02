const FormData = require("form-data");

const BEARER = process.env.BEARER;

const fileConfig = (fileBuffer, name) => {
  const formData = new FormData();
  formData.append("image", fileBuffer);
  formData.append("name", name);
  const config = {
    url: "https://api.imgur.com/3/image",
    method: "post",
    headers: {
      Authorization: `Bearer 6ef0c1cf122476f807ea1f2ddd1806f81e69112f`,
      ...formData.getHeaders(),
    },
    data: formData,
  };
  return config;
};

module.exports = fileConfig;
