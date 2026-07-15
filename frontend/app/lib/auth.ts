import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? "",
);

async function signUpNewUser(email: any, password: any) {
  console.log("in signup route");
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: "http://localhost:3000",
    },
  });
  if (error) console.log(error);
  console.log(data);
}

async function signInWithEmail(email: any, password: any) {
  console.log("in signIn route");
  console.log(email);
  console.log(password);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) console.log(error);
  console.log(data);
}

export { signUpNewUser, signInWithEmail };
