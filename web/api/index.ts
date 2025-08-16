import * as user from './modules/user';
import * as account from './modules/account';
import * as dep from './modules/dep';
import * as menu from './modules/menu';
import * as module from './modules/module';
import * as role from './modules/role';
import { useGraphQLQuery } from '@/hooks/use-graphql';
import { GET_ROUTES } from './graphql/queries';

const getRoutes = async () => {
    const {data, error, isLoading} = useGraphQLQuery<{ routes: any }, {}>(
        GET_ROUTES,
        {},
        {
            shouldRetryOnError: false,
            revalidateOnReconnect: true
        }
    );
    return { routes: data?.routes, isLoading, error }
}

export default {
    user,
    account,
    dep,
    menu,
    module,
    role,
    getRoutes
}