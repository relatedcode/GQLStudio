/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import React from 'react';
import { astFromValue, print } from 'graphql';

const printDefault = (ast) => {
  if (!ast) {
    return '';
  }
  return print(ast);
};

export default function DefaultValue({ field }) {
  // field.defaultValue could be null or false, so be careful here!
  if ('defaultValue' in field && field.defaultValue !== undefined) {
    return (
      <span>
        {' = '}
        <span className="arg-default-value">
          {printDefault(astFromValue(field.defaultValue, field.type))}
        </span>
      </span>
    );
  }

  return null;
}
