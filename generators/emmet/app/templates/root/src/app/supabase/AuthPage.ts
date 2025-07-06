import { requireUser } from '@/app/supabase/requireUser';

export function requireAuth<PageProps = unknown>(
    page: (user: any) => Promise<JSX.Element>
): () => Promise<JSX.Element> {
    return async function WrappedPage() {
        const user = await requireUser();
        return page(user);
    };
}