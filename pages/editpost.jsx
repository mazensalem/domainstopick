import { ObjectId } from "mongodb";
import React from "react";
import client from "../lib/mongodb";
import { getSession } from "next-auth/react";
import { useState } from "react";
import Router from "next/router";

export default function editpost({
  utitle,
  udescription,
  uimage,
  error,
  image_public_id,
  postid,
}) {
  const [title, settitle] = useState(utitle);
  const [description, setdescription] = useState(udescription);
  const [imageurl, setimageurl] = useState(uimage);
  const [image, setimage] = useState();
  const [errors, seterrors] = useState(error);
  const [isloading, setisloading] = useState("");

  const uploadimage = (e) => {
    if (e.target.files[0]) {
      setimage(e.target.files[0] || "");
      setimageurl(URL.createObjectURL(e.target.files[0] || ""));
    }
  };
  const readimage = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const sendimage = async () => {
    const result = { image_url: "", image_public_id: "" };
    if (image) {
      const body = await readimage(image);
      let data = {};
      try {
        const rdata = await fetch("/api/sendimage", {
          method: "POST",
          body: JSON.stringify({ image: body, folder: "postsimages" }),
        });
        data = await rdata.json();
      } catch (error) {
        setloading("");
        seterrors("there is an error on uploading your image");
      }
      if (data.secure_url) {
        result.image_url = data.secure_url;
        result.image_public_id = data.public_id;
      } else {
        setloading("");
        seterrors(
          data.error ||
            "there is an error in uploading your image please contact our support"
        );
      }
    }
    return result;
  };

  const send = async (e) => {
    e.preventDefault();
    setisloading("loading");
    seterrors("");
    let image_url = uimage;
    if (!title) {
      setisloading("");
      seterrors("you should enter a title");
      return;
    }
    if (!description) {
      setisloading("");
      seterrors("you should enter a description");
      return;
    }
    if (image) {
      if (image_public_id) {
        await fetch("/api/deleteimage", {
          method: "POST",
          body: JSON.stringify({ public_id: image_public_id }),
        });
      }
      const uploadresult = await sendimage();
      image_url = uploadresult.image_url;
      image_public_id = uploadresult.image_public_id;
    }
    const post = {
      id: postid,
      title,
      text: description,
      image_url,
      image_public_id,
    };
    const rresult = await fetch("/api/editpost", {
      method: "POST",
      body: JSON.stringify(post),
    });
    const result = await rresult.json();
    if (result.content == "done") {
      Router.push("/post/" + postid);
    } else {
      seterrors("there is a problem with editing your post");
      setisloading("");
    }
  };
  return (
    <div>
      {isloading}
      {errors}
      <form onSubmit={send}>
        <img src={imageurl} />
        <input
          type="text"
          value={title}
          onChange={(e) => settitle(e.target.value)}
        />
        <textarea
          value={description}
          onChange={(e) => setdescription(e.target.value)}
        />
        <input type="file" onChange={uploadimage} />
        <input type="submit" />
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  let props = {};
  const session = await getSession({ req });
  if (session) {
    const postid = context.query.id;
    const cl = await client;
    const ucol = await cl.db().collection("users");
    const pcol = await cl.db().collection("posts");
    const dpost = await pcol.findOne({ _id: new ObjectId(postid) });
    const user = await ucol.findOne({ email: session.user.email });
    if (dpost) {
      if (user.posts.includes(`"` + postid + `"`)) {
        props.utitle = dpost.title;
        props.udescription = dpost.text;
        props.uimage = dpost.image_url;
        props.image_public_id = dpost.image_public_id;
        props.postid = postid;
      } else {
        props.error = "you can't edit this post";
      }
    } else {
      props.error = "we can't find this post";
    }
  }
  return { props };
}
