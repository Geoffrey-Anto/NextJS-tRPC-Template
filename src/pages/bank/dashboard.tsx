import { GetServerSideProps } from "next";
import React from "react";

interface Props {
  message?: String;
}

const Dashboard = ({ message }: Props) => {
  return <div>{message ? message : "Dashboard"}</div>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const cookies = req.cookies;

  const isBankTokenAvailable: string | undefined = cookies["bank_token"];
  const isUserTokenAvailable: string | undefined = cookies["user_token"];

  if (!isBankTokenAvailable && !isUserTokenAvailable) {
    return {
      redirect: {
        destination: "/landing",
        permanent: false,
      },
    };
  }

  if (isBankTokenAvailable && isUserTokenAvailable) {
    // delete the user token
    res.setHeader(
      "Set-Cookie",
      `user_token=; path=/; httpOnly; sameSite=strict; Max-Age=0`
    );

    return {
      props: {
        message: "Continuing as a bank",
      },
    };
  }

  if (!isBankTokenAvailable) {
    return {
      redirect: {
        destination: "/auth/login/Bank",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export default Dashboard;
