import { getAuth } from "firebase/auth";

import React, { useState } from "react";
import { firebase, auth } from "../../utils/firebase";

const Otp = () => {
  // Inputs
  const [mynumber, setnumber] = useState("");
  const [otp, setotp] = useState("");
  const [show, setshow] = useState(false);
  const [final, setfinal] = useState("");

  // Sent OTP
  const signin = () => {
    if (mynumber === "" || mynumber.length <= 10) return;

    let verify = new firebase.auth.RecaptchaVerifier("recaptcha-container");
    auth
      .signInWithPhoneNumber(mynumber, verify)
      .then((result) => {
        setfinal(result);
        alert("code sent");
        setshow(true);
      })
      .catch((err) => {
        alert(err);
        window.location.reload();
      });
  };

  // Validate OTP
  const ValidateOtp = () => {
    if (otp === null || final === null) return;
    final
      .confirm(otp)
      .then((result) => {
        localStorage.setItem("otp", "verified");
        window.location.href = "/aggForm";
        alert("success");
      })
      .catch((err) => {
        alert("Wrong code");
      });
  };

  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "skyBlue",
          width: "80vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "5rem",
          flexDirection: "column",
        }}
      >
        <center>
          <h1 style={{ padding: "2rem", fontWeight: "700", fontSize: "2rem" }}>
            {!show
              ? "Please Enter Your Mobile Number"
              : "Please Enter The Otp Sent TO Your Mobile Number"}
          </h1>
        </center>
        <center>
          <div style={{ display: !show ? "block" : "none" }}>
            <input
              style={{
                border: "1px solid black",
                padding: "0.25rem",
                borderRadius: "0.25rem",
              }}
              value={mynumber}
              onChange={(e) => {
                setnumber(e.target.value);
              }}
              placeholder="phone number"
            />
            <br />
            <br />
            <div id="recaptcha-container"></div>
            <button className="btn btn-dark" onClick={signin}>
              Send OTP
            </button>
          </div>
          <div style={{ display: show ? "block" : "none" }}>
            <input
              type="text"
              placeholder={"Enter your OTP"}
              style={{
                border: "1px solid black",
                padding: "0.25rem",
                borderRadius: "0.25rem",
              }}
              onChange={(e) => {
                setotp(e.target.value);
              }}
            ></input>
            <br />
            <br />
            <button className="btn btn-dark" onClick={ValidateOtp}>
              Verify
            </button>
          </div>
        </center>
      </div>
    </div>
  );
};

export default Otp;
