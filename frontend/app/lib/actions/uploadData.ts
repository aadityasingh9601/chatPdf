"use server";

import axios from "axios";

export const uploadData = async (userId:any,data: any) => {
  console.log("User Id ->", userId)
  console.log("data", data);
  const formData = new FormData();
  formData.append("file",data);
  const res = await axios.post(
    `http://localhost:8000/api/upload?userId=${userId}`,
    formData,
    {
    },
  );
  console.log(res);
  return {
    success: true,
    message: res.data,
  };
};
