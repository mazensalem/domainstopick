import React from "react";
import { useState } from "react";

const App = () => {
  const [file, setfile] = useState("");
  const [iurl, setiurl] = useState("");
  const handelsubmit = async (e) => {
    e.preventDefault();
    const body = new FileReader();
    body.readAsDataURL(file);
    body.onloadend = () => {
      console.log(body.result);
      fetch("/api/uploadtester", {
        method: "POST",
        body: body.result,
      });
    };
  };
  return (
    <>
      <form onSubmit={handelsubmit}>
        <input
          type="file"
          name="file"
          onChange={(e) => {
            setfile(e.target.files[0]);
            setiurl(URL.createObjectURL(e.target.files[0]));
          }}
        />
        <img src={iurl} />
        <input type="submit" />
      </form>
    </>
  );
};

export default App;
