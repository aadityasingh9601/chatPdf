"use server";

import axios from "axios";

export const uploadData = async (data: any) => {
  console.log("data", data);
  const formData = new FormData();
  formData.append("file",data);
  const res = await axios.post(
    "http://localhost:8000/api/upload",
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
