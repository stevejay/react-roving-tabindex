import { ElementType } from 'react';
import 'core-js/es/array/find';
import 'core-js/es/array/find-index';
import 'core-js/es/map';
import Layout from './layout';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const decorators = [
  (Story: ElementType) => (
    <Layout>
      <Story />
    </Layout>
  ),
];
