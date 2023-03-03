import { HomeState } from '../states/home';
import debugConfig from './debug';

const config = {
  storageType: 'indexedDB',
  defaultState: HomeState,

  ...(G_IS_DEV ? debugConfig : {}),
};

export default config;
