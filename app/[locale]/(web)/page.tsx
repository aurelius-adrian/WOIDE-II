"use server";

import { redirect } from "next/navigation";

export async function Main() {
    redirect("/home");
}

export default Main;
