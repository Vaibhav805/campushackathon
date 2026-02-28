"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  ConnectionRow,
  ConnectionStatus,
  UserProfileRow,
} from "@/types";

export interface ConnectionWithProfile {
  connection: ConnectionRow;
  user: UserProfileRow;
}

export async function getPendingRequests(): Promise<ConnectionWithProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("connections")
    .select("id,sender_id,receiver_id,status,created_at")
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !rows || rows.length === 0) return [];

  const senderIds = Array.from(
    new Set(rows.map((row) => row.sender_id).filter(Boolean))
  );

  if (senderIds.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("users")
    .select("id,name,year,skills,interests,goal")
    .in("id", senderIds);

  if (profilesError || !profiles) return [];

  const profileById = new Map<string, UserProfileRow>();
  for (const p of profiles as UserProfileRow[]) {
    profileById.set(p.id, p);
  }

  return (rows as ConnectionRow[])
    .map((row) => {
      const userProfile = profileById.get(row.sender_id);
      if (!userProfile) return null;
      return { connection: row, user: userProfile };
    })
    .filter(
      (v): v is ConnectionWithProfile => v !== null
    );
}

export async function getAcceptedConnections(): Promise<
  ConnectionWithProfile[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("connections")
    .select("id,sender_id,receiver_id,status,created_at")
    .eq("status", "accepted")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error || !rows || rows.length === 0) return [];

  const counterpartIds = Array.from(
    new Set(
      rows
        .map((row) =>
          row.sender_id === user.id ? row.receiver_id : row.sender_id
        )
        .filter(Boolean)
    )
  );

  if (counterpartIds.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("users")
    .select("id,name,year,skills,interests,goal")
    .in("id", counterpartIds);

  if (profilesError || !profiles) return [];

  const profileById = new Map<string, UserProfileRow>();
  for (const p of profiles as UserProfileRow[]) {
    profileById.set(p.id, p);
  }

  return (rows as ConnectionRow[])
    .map((row) => {
      const counterpartId =
        row.sender_id === user.id ? row.receiver_id : row.sender_id;
      const userProfile = counterpartId ? profileById.get(counterpartId) : null;
      if (!userProfile) return null;
      return { connection: row, user: userProfile };
    })
    .filter(
      (v): v is ConnectionWithProfile => v !== null
    );
}

export async function updateConnectionStatus(
  connectionId: string,
  status: ConnectionStatus
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing, error } = await supabase
    .from("connections")
    .select("id,receiver_id")
    .eq("id", connectionId)
    .single<Pick<ConnectionRow, "id" | "receiver_id">>();

  if (error || !existing || existing.receiver_id !== user.id) return;

  await supabase
    .from("connections")
    .update({ status })
    .eq("id", connectionId);

  revalidatePath("/requests");
}

export async function acceptConnection(connectionId: string): Promise<void> {
  await updateConnectionStatus(connectionId, "accepted");
}

export async function rejectConnection(connectionId: string): Promise<void> {
  await updateConnectionStatus(connectionId, "rejected");
}

