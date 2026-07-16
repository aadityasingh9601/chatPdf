"use server";

import axios from "axios";

export const fetchData = async (userId: any) => {
  console.log(userId);
  const res = await axios.get(
    `http://localhost:8000/api/getpdfs?userId=${userId}`,
    {},
  );
  console.log(res);
  return {
    success: true,
    message: res.data,
  };
};
