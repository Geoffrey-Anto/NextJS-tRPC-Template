import React from "react";
import { trpc } from "../utils/trpc";

const Trash = () => {
  const { mutateAsync: create } = trpc.useMutation("kyc.create");

  const registerBank = async () => {
    const res = await create({
      aadharId: "123456789012",
      panId: "ABCDE1234F",
      driverLicenseId: "123456789012",
      passport: "123456789012",
    });
    console.log(res);
  };

  return <div onClick={registerBank} className="p-5 bg-red-700 w-fit"></div>;
};

export default Trash;
