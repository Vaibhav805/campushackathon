import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ConnectionRow, ConnectionStatus } from "@/types";

interface CreateConnectionBody {
  receiverId?: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as CreateConnectionBody;
    const receiverId = body.receiverId;

    if (!receiverId || typeof receiverId !== "string") {
      return NextResponse.json(
        { error: "Missing receiverId in request body" },
        { status: 400 }
      );
    }

    if (receiverId === user.id) {
      return NextResponse.json(
        { error: "Cannot create a connection with yourself" },
        { status: 400 }
      );
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    const existing = (existingRows?.[0] ?? null) as ConnectionRow | null;
    if (existing) {
      return NextResponse.json({ connection: existing satisfies ConnectionRow });
    }

    const { data, error } = await supabase
      .from("connections")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: "pending" as ConnectionStatus,
      })
      .select("*")
      .single<ConnectionRow>();

    if (error || !data) {
      throw error ?? new Error("Failed to create connection");
    }

    return NextResponse.json(
      { connection: data satisfies ConnectionRow },
      { status: 201 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create connection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

