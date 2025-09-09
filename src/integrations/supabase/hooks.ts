import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./client";

type TableName = "farms" | "history" | "alerts" | "preferences";

function getTableKey(table: TableName, filter?: Record<string, unknown>) {
  return ["supabase", table, filter ?? {}];
}

export function useTableQuery<T>(table: TableName, filter?: Record<string, unknown>) {
  return useQuery({
    queryKey: getTableKey(table, filter),
    queryFn: async () => {
      let query = supabase.from(table).select("*");
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          // @ts-ignore - supabase js types support column filters
          query = query.eq(key, value as never);
        });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as T[];
    },
  });
}

export function useTableInsert<T extends Record<string, unknown>>(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: T) => {
      const { data, error } = await supabase.from(table).insert(payload).select();
      if (error) throw error;
      return data?.[0] as T;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supabase", table] }),
  });
}

export function useTableUpdate<T extends { id: string }>(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<T> & { id: string }) => {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", payload.id)
        .select();
      if (error) throw error;
      return data?.[0] as T;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supabase", table] }),
  });
}

export function useTableDelete(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supabase", table] }),
  });
}





