import { SupabaseClient } from "@supabase/supabase-js";
import {PostgrestFilterBuilder} from "@supabase/postgrest-js";

function applyEqFilters<T extends Record<string, any>>(query: any, filters: T) {
    for (const [key, value] of Object.entries(filters)) {
        const jsonbKey = `data->>${key}`;
        console.log(jsonbKey + value)
        query = query.eq(jsonbKey, value);
    }
    return query;
}

export const readmodel = (collection: string, supabase: SupabaseClient) => ({
    findAll: async <T>(query?: Record<string, any>,
                       queryWrapper: (query:PostgrestFilterBuilder<any,any,any,any,any>)=>PostgrestFilterBuilder<any, any,any,any,any> = (query)=>query): Promise<T[]> => {
        var query1    = supabase.from(collection).select("data");
        let qb = queryWrapper(query1);
        qb = applyEqFilters(qb, query ?? {});
        const response = await qb;
        if (response.error) throw response.error;
        return response.data.map((it:any) => it.data) as T[];
    },

    findById: async <T>(id: string): Promise<T | null> => {
        const response = await supabase
            .from(collection)
            .select("data")
            .eq("_id", id)
            .single();
        if (response.error) throw response.error;
        return response.data?.data as T | null;
    },

});
