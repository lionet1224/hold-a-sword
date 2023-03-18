import debugConfig from './debug';

const config = {
  storageType: 'indexedDB',
  defaultState: 'home',

  ...(G_IS_DEV ? debugConfig : {}),
};

export default config;
