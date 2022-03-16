import cloudinary from "cloudinary";

export default async (req, res) => {
  cloudinary.v2.config({
    cloud_name: "dc1fhdtwe",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const resbond = await cloudinary.v2.uploader.upload(req.body, {});
  console.log(resbond);
};

// import formidable from "formidable";
// import fs from "fs";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const post = async (req, res) => {
//   const form = new formidable.IncomingForm();
//   form.parse(req, async function (err, fields, files) {
//     console.log(files);
//     // await saveFile(files.file);
//     return res.status(201).send("");
//   });
// };

// const saveFile = async (file) => {
//   const data = fs.readFileSync(file.path);
//   fs.writeFileSync(`./public/${file.name}`, data);
//   await fs.unlinkSync(file.path);
//   return;
// };

// export default (req, res) => {
//   req.method === "POST"
//     ? post(req, res)
//     : req.method === "PUT"
//     ? console.log("PUT")
//     : req.method === "DELETE"
//     ? console.log("DELETE")
//     : req.method === "GET"
//     ? console.log("GET")
//     : res.status(404).send("");
// };