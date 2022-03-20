import React from "react";
import { useState } from "react";
import Router from "next/router";

export default function addpost() {
  const [title, settitle] = useState("");
  const [text, settext] = useState("");
  const [image, setimage] = useState("");
  const [imageurl, setimageurl] = useState("");
  const [errors, seterrors] = useState("");
  const [loading, setloading] = useState("");

  const imageupload = async (e) => {
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
    setloading("loading");
    seterrors("");
    if (!title) {
      setloading("");
      seterrors("you should enter a title");
      return;
    }
    if (!text) {
      setloading("");
      seterrors("you should enter a description");
      return;
    }
    const { image_url, image_public_id } = await sendimage();
    const post = {
      title,
      text,
      image_url,
      image_public_id,
      likes: [],
      comments: [],
    };
    const resbondobj = await fetch("/api/addpost", {
      method: "POST",
      body: JSON.stringify(post),
    });
    const result = await resbondobj.json();
    if (result.content == "done") {
      Router.push("/profile");
    } else {
      setloading("");
      seterrors(result.error || "there is an error on uploading your post");
    }
  };

  return (
    <div>
      <form onSubmit={send}>
        {errors}
        {loading}
        <img src={imageurl} />
        <input
          type="text"
          placeholder="enter the tilte"
          value={title}
          onChange={(e) => settitle(e.target.value)}
        />
        <textarea value={text} onChange={(e) => settext(e.target.value)} />
        <input type="file" onChange={imageupload} />
        <input
          type="button"
          value="delete image"
          onClick={() => {
            setimageurl("");
            setimage("");
          }}
        />
        <input type="submit" />
      </form>
    </div>
  );
}
