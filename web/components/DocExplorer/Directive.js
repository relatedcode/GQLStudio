/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import React from 'react';

export default function Directive({ directive }) {
  return (
    <span className="doc-category-item" id={directive.name.value}>
      {'@'}
      {directive.name.value}
    </span>
  );
}
