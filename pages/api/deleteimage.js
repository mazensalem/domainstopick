import cloudinary from "cloudinary";

export default async (req, res) => {
  cloudinary.v2.config({
    cloud_name: "dc1fhdtwe",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const resbond = await cloudinary.v2.uploader.destroy(
    JSON.parse(req.body).public_id
  );
  res.json(resbond);
};
