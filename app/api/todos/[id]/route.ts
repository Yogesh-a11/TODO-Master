import {  NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE( 
    {params}: {params: {id: string}}
){
    const { userId} = await auth()
    if (!userId) {
        return NextResponse.json({error: "Unauthorized", }, {status: 401})
    }

    try {
        const todoId = params.id

        const todo = await prisma.todo.findUnique({
            where: {id: todoId}
        })
        if (!todo) {
            return NextResponse.json({error: "Todo not Found", }, {status: 401})
        }

        if (todo.userId !== userId) {
            return NextResponse.json({ error: "Forbidden"}, {status: 403})
        }

        await prisma.todo.delete({
            where: {id: todoId}
        })
        return NextResponse.json({ message: "todo deleted sauccessfully"}, {status: 200})
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message}, {status: 500})
        }
    }
}