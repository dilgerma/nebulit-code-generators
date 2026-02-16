import {SupabaseClient} from "@supabase/supabase-js";
import {PostgrestFilterBuilder} from "@supabase/postgrest-js";


export const readmodel = (collection: string, supabase: SupabaseClient) => ({
    findAll: async <T>(query?: Record<string, any>,
                       queryWrapper: (query: PostgrestFilterBuilder<any, any, any, any, any>) => PostgrestFilterBuilder<any, any, any, any, any> = (query) => query): Promise<T[]> => {
        var query1 = supabase.from(collection).select("*");
        Object.entries(query??{}).forEach((it,value) => {
            query1 = query1.eq(it[0], it[1])
        })
        let qb = queryWrapper(query1);
        const response = await qb;
        if (response.error) throw response.error;
        return response.data as T[]
    },

    findById: async <T>(idcolumn: string, id: string): Promise<T | null> => {
        const response = await supabase
            .from(collection)
            .select("*")
            .eq(idcolumn, id)
            .maybeSingle();
        if (response.error) throw response.error;
        return response as T | null;
    },

});
