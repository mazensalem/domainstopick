import React from "react";
import { useState } from "react";
import Router from "next/router";

export default function addpost() {
  const [title, settitle] = useState("");
  const [text, settext] = useState("");
  const [image, setimage] = useState("");

  const imageupload = async (e) => {
    if (e.target.files[0]) {
      setimage(e.target.files[0]);
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
    const result = { image_url: "" };
    if (image) {
      const body = await readimage(image);
      const rdata = await fetch("/api/sendimage", {
        method: "POST",
        body,
      });
      const data = await rdata.json();
      if (data.secure_url) {
        result.image_url = data.secure_url;
      } else {
        // seterror(
        //   data.error ||
        //     "there is an error in uploading your image please contact our support"
        // );
      }
    }
    return result;
  };

  const send = async (e) => {
    e.preventDefault();
    if (!title) {
      // seterror("you should enter your name");
      return;
    }
    const { image_url } = await sendimage();
    const post = {
      title,
      text,
      image_url,
    };
    const resbondobj = await fetch("/api/addpost", {
      method: "POST",
      body: JSON.stringify(post),
    });
    const result = await resbondobj.json();
    if (result.content == "done") {
      Router.push("/profile");
    } else {
      // seterror(result.error);
    }
  };

  return (
    <div>
      <form onSubmit={send}>
        <input
          type="text"
          placeholder="enter the tilte"
          value={title}
          onChange={(e) => settitle(e.target.value)}
        />
        <textarea value={text} onChange={(e) => settext(e.target.value)} />
        <input type="file" />
        <input type="submit" />
      </form>
    </div>
  );
}
