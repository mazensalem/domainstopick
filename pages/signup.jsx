import React, { useState } from "react";
import Router from "next/router";
import { getSession } from "next-auth/react";
import client from "../lib/mongodb";

export default function signup({ img, check, ubio, uname, email, img_id }) {
  const [image, setimage] = useState();
  const [newsletter, setnewsletter] = useState(check || false);
  const [name, setname] = useState(uname || "");
  const [bio, setbio] = useState(ubio || "");
  const [url, seturl] = useState(img || "/user.png");
  const [error, seterror] = useState("");
  const [isloading, setisloading] = useState("");

  const imageupload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const i = e.target.files[0];
      setimage(i);
      seturl(URL.createObjectURL(i));
    }
  };

  const imagedelete = () => {
    setimage(null);
    seturl("./user.png");
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

  const deleteimage = async () => {
    const rresult = await fetch("/api/deleteimage", {
      method: "POST",
      body: JSON.stringify({ public_id: img_id }),
    });
    const result = await rresult.json();
    if (result.result == "ok") {
      img_id = "";
    }
    return result;
  };

  const sendimage = async () => {
    const result = { image_url: "", image_public_id: "" };
    let body = null;
    if (image) {
      body = await readimage(image);
    }
    if (img_id) {
      const result = await deleteimage();
      if (result.result != "ok") {
        setisloading("");
        seterror(
          "your photo isn't found please refresh the page and try again if i still happens please contact the support"
        );
        return;
      }
    }
    if (body) {
      let data = {};
      try {
        const rdata = await fetch("/api/sendimage", {
          method: "POST",
          body: JSON.stringify({ image: body, folder: "usersimages" }),
        });
        data = await rdata.json();
      } catch (e) {
        seterror("there is an error on your image");
      }
      if (data.secure_url) {
        result.image_url = data.secure_url;
        result.image_public_id = data.public_id;
      } else {
        setisloading("");
        seterror(
          data.error ||
            "there is an error in uploading your image please contact our support"
        );
      }
    }
    return result;
  };

  const send = async (e) => {
    e.preventDefault();
    seterror("");
    if (!name) {
      setisloading("");
      seterror("you should enter your name");
      return;
    }
    const { image_url, image_public_id } = await sendimage();
    const user = {
      name: e.target.name.value,
      bio: e.target.bio.value,
      newsletter,
      image_url,
      image_public_id,
    };
    const userobj = await fetch("/api/singup", {
      method: "POST",
      body: JSON.stringify(user),
    });
    const result = await userobj.json();
    if (result.content == "wellcome") {
      Router.push("/profile");
    } else {
      setisloading("");
      seterror(result.error);
    }
  };
  return (
    <div>
      singup
      {isloading}
      <form onSubmit={send}>
        {error}
        singined in as {email}
        <img width={200} height={200} src={url} alt="userimage" />
        <input type="file" name="image" onChange={imageupload} />
        <input type="button" value="delete image" onClick={imagedelete} />
        <input
          type="checkbox"
          name="newsletter"
          value={newsletter}
          checked={newsletter}
          onChange={() => {
            setnewsletter(!newsletter);
          }}
        />
        <input
          type="text"
          name="name"
          value={name || ""}
          onChange={(e) => {
            setname(e.target.value);
          }}
        />
        <textarea
          name="bio"
          value={bio || ""}
          onChange={(e) => {
            setbio(e.target.value);
          }}
        />
        <input type="submit" onClick={() => setisloading("loading")} />
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const session = await getSession({ req });
  let props = {};
  if (session) {
    const email = session.user.email;
    const cl = await client;
    const col = await cl.db().collection("users");
    const user = await col.findOne({ email });
    props = {
      img: user.image_url || "",
      img_id: user.image_public_id || null,
      check: user.newsletter || "",
      ubio: user.bio || "",
      uname: user.name || "",
      email,
    };
  }
  return { props };
}
