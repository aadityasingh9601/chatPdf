"use server";

import axios from "axios";

export const deleteData = async (pdfId: any, fileName:any,userId:any) => {
  console.log("pdfId ->",pdfId);
  console.log("userId", userId);
  console.log("fileName", fileName)
  const res = await axios.delete(
    `http://localhost:8000/api/pdf?pdfId=${pdfId}&fileName=${fileName}&userId=${userId}`,
    {},
  );
  console.log(res);
  return {
    success: true,
    message: res.data,
  };
};
