"use server";

import axios from "axios";

export const sendQuery = async (pdfName:any, userQuery: any) => {
  console.log(userQuery);
  const res = await axios.get(
    `http://localhost:8000/api/userquery?query=${userQuery}`,
    {},
  );
  console.log(res);
  return {
    success: true,
    message: res.data,
  };
};
