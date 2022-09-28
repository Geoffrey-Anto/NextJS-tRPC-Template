import React from "react";
import styles from "../../styles/Form.module.css";

const LoginForm = () => {
  return (
    <>
      <div className={styles.form_div}>
        <div>
          <h1 className="font-bold text-7xl text-white">KYEASY</h1>
          <br></br>
          <p className="font-semibold text-xl text-white">We will help you to ease down your KYC Process</p>
        </div>
        <form className={styles.form}>
        <h1 className="font-bold text-3xl py-3 text-white">LOGIN</h1>

          <input
            type="text"
            className={styles.input}
            placeholder="Enter Your Name"
          ></input>
          <br></br>
          <input
            type="email"
            className={styles.input}
            placeholder="Enter Your Email"
          ></input>
          <br></br>
          <input 
            type="password"
            className={styles.input}
            placeholder="Enter Your Password"
          ></input>
          <br></br>
          <button type="submit" className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">Submit</button>
        </form>
       
      </div>
    </>
  );
};

export default LoginForm;
