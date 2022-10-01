import React from "react";
import { trpc } from "../utils/trpc";

const Trash = () => {
  const { mutateAsync: create } = trpc.useMutation("kyc.create");

  const { data, isLoading } = trpc.useQuery([
    "kyc.getForMe",
    {
      take: 10,
    },
  ]);

  const registerBank = async () => {
    const res = await create({
      aadharId: "123456789012",
      panId: "ABCDE1234Fdsa",
      driverLicenseId: "123456789012",
      passport: "123456789012",
    });
    console.log(res);

    // const res = await create({
    //   email: "geoffreyanto12@gmail.com",
    //   name: "Geoffrey",
    //   password: "123456789",
    // });

    // return res;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div onClick={registerBank} className="p-5 bg-red-300 w-fit">
      {JSON.stringify(data)}
    </div>
  );
};

export default Trash;
