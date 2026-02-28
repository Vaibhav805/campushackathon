import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ConnectionRow, ConnectionStatus } from "@/types";

interface StatusResponse {
  statuses: Record<string, ConnectionStatus>;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const peerIdsParam = url.searchParams.get("peerIds");

    if (!peerIdsParam) {
      const empty: StatusResponse = { statuses: {} };
      return NextResponse.json(empty);
    }

    const peerIds = Array.from(
      new Set(
        peerIdsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      )
    );

    if (peerIds.length === 0) {
      const empty: StatusResponse = { statuses: {} };
      return NextResponse.json(empty);
    }

    const { data: sentRows, error: sentError } = await supabase
      .from("connections")
      .select("id,sender_id,receiver_id,status")
      .eq("sender_id", user.id)
      .in("receiver_id", peerIds);

    if (sentError) {
      throw sentError;
    }

    const { data: receivedRows, error: receivedError } = await supabase
      .from("connections")
      .select("id,sender_id,receiver_id,status")
      .eq("receiver_id", user.id)
      .in("sender_id", peerIds);

    if (receivedError) {
      throw receivedError;
    }

    const rows: ConnectionRow[] = [
      ...(sentRows ?? []),
      ...(receivedRows ?? []),
    ] as ConnectionRow[];

    const statuses: Record<string, ConnectionStatus> = {};

    for (const row of rows) {
      const counterpartId =
        row.sender_id === user.id ? row.receiver_id : row.sender_id;
      if (!peerIds.includes(counterpartId)) continue;
      statuses[counterpartId] = row.status;
    }

    const payload: StatusResponse = { statuses };
    return NextResponse.json(payload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch connection statuses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

