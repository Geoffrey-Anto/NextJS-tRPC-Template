import type { NextPage } from "next";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["user.getAll", {}]);

  if (isLoading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
};

export default Home;
