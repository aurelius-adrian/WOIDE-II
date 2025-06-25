"use server";

import { redirect } from "next/navigation";

export default async function Main() {
    redirect("/home");

    return <></>;
}
