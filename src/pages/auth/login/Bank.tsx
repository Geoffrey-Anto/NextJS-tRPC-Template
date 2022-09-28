import React from "react";
import styles from "../../../../styles/userlogin.module.css";

interface BankLoginInput {
  email: string;
  password: string;
}

const InitialBankData = {
  email: "",
  password: "",
};

const BankLogin = () => {
  const [bank, setBank] = React.useState<BankLoginInput>(InitialBankData);

  const onSubmitHandler = (
    e: React.MouseEvent<HTMLFormElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (
      bank &&
      bank.email &&
      bank.password &&
      bank.email.length > 5 &&
      bank.password.length > 6
    ) {
      console.log(bank);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-center p-4 flex-wrap">
      <div className="flex flex-col text-center mt-6 w-full max-w-sm">
        <h1 className="font-bold text-5xl md:text-7xl text-white tracking-widest">
          KYEASY
        </h1>
        <br></br>
        <p className="font-semibold text-xl text-white">
          We will help you to ease down your KYC Process
        </p>
      </div>
      <form
        onSubmit={onSubmitHandler}
        className={
          "w-full h-full flex flex-col items-center justify-around mt-14 bg-blue-500 p-2 rounded-lg max-w-sm"
        }
      >
        <h1 className="font-bold text-3xl py-3 text-white mb-1">BANK LOGIN</h1>
        <input
          type="email"
          className={styles.input}
          placeholder="Enter Your Email"
          onChange={(e) => {
            setBank({ ...bank, email: e.target.value });
          }}
        />
        <br></br>
        <input
          type="password"
          className={styles.input}
          placeholder="Enter Your Password"
          onChange={(e) => {
            setBank({ ...bank, password: e.target.value });
          }}
        />
        <br></br>
        <button
          type="submit"
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BankLogin;
