import { searchParams } from "@/utils/search-params"
import { useQueryStates } from "nuqs"

export const useSearchParamsState = () => {
    const [state, setState] = useQueryStates(searchParams, {
        history: 'push',
        shallow: true,
        scroll: false
    });

    return [state, setState] as const;
}
