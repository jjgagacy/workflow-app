import * as user from './graphql/account/modules/user';
import * as account from './graphql/account/modules/account';
import * as dep from './graphql/account/modules/dep';
import * as menu from './graphql/account/modules/menu';
import * as module from './graphql/account/modules/module';
import * as role from './graphql/account/modules/role';
import * as modelProvider from './graphql/model-provider/settings/model-provider';
import * as marketplace from './graphql/model-provider/marketplace/index';
import * as plugin from './graphql/plugin/index';
import { useGraphQLQuery } from '@/hooks/use-graphql';
import { GET_ROUTES } from './graphql/account/queries';

const getRoutes = async () => {
  const { data, error, isLoading } = useGraphQLQuery<{ routes: any }, {}>(
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
  getRoutes,
  modelProvider,
  plugin,
  marketplace
}