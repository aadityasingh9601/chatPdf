"use server";

import axios from "axios";

export const sendQuery = async (userId: any, pdfName: any, userQuery: any) => {
  console.log(userQuery);
  const res = await axios.get(
    `http://localhost:8000/api/userquery?userId=${userId}&pdfName=${pdfName}&query=${userQuery}`,
    {},
  );
  console.log(res);
  return {
    success: true,
    message: res.data,
  };
};
