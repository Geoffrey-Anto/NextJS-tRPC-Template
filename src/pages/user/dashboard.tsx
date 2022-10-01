import { GetServerSideProps } from "next";
import React from "react";
import { trpc } from "../../utils/trpc";
import * as jwt from "jsonwebtoken";

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
      props: {},
    };
  }

  if (isBankTokenAvailable && isUserTokenAvailable) {
    // delete the bank token
    res.setHeader(
      "Set-Cookie",
      `bank_token=; path=/; httpOnly; sameSite=strict; Max-Age=0`
    );

    return {
      props: {
        message: "Continuing as a user",
      },
    };
  }

  if (!isUserTokenAvailable) {
    return {
      redirect: {
        destination: "/auth/login/User",
        permanent: false,
      },
      props: {},
    };
  }

  const payload = jwt.decode(isUserTokenAvailable) as any;

  if (!payload) {
    return {
      redirect: {
        destination: "/auth/login/User",
        permanent: false,
      },
      props: {},
    };
  }

  const kyc_token = cookies["kyc_token"];

  if (!kyc_token) {
    return {
      redirect: {
        destination: "/Kyc/EnterDetails",
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export default Dashboard;
