import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error("Missing Webhook Secret");
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp  = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_signature || !svix_timestamp) {
        return new Response("Error occured - No Svix headers")
    } 

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt : WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }) as WebhookEvent
        console.log(evt)
        const {id} = evt.data
        const eventType = evt.type


        if (eventType === "user.created") {
            try {
                const {email_addresses, primary_email_address_id} = evt.data;
                console.log(email_addresses, primary_email_address_id)

                const primaryEmail = email_addresses.find(
                    (email) => email.id === primary_email_address_id
                )

                if (!primaryEmail) {
                    return new Response("No Primary email found", {status: 400})
                }

                //create a user in neon (postgresql)

                const newUser = await prisma.user.create({
                    data: {
                        id: evt.data.id!,
                        email: primaryEmail.email_address,
                        isSubscribed: false
                    }
                })
                console.log("User created", newUser)
            } catch (error) {
                if (error instanceof Error) {
                    console.log("Error in creating user", error)
                    return new Response("Error occured", {status:400})
                }
            
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error verifying webhook", error)
            return new Response("Error occured", {status:400})
        }
    }


        return new Response("Successfully webhook recived", {status: 200})

        
}