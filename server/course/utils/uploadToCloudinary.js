const cloudinary = require("../../config/cloudinary");

const uploadToCloudinary = async (file, folder) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder,
  });

  return result.secure_url;
};

module.exports = uploadToCloudinary;
