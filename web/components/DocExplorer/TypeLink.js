/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import React from 'react';
import { GraphQLList, GraphQLNonNull } from 'graphql';

export default function TypeLink(props) {
  const onClick = props.onClick ? props.onClick : () => null;
  return renderType(props.type, onClick);
}

function renderType(type, onClick) {
  if (type instanceof GraphQLNonNull) {
    return (
      <span className="text-gray-500">
        {renderType(type.ofType, onClick)}
        {'!'}
      </span>
    );
  }
  if (type instanceof GraphQLList) {
    return (
      <span className="text-gray-500">
        {'['}
        {renderType(type.ofType, onClick)}
        {']'}
      </span>
    );
  }
  return (
    <a
      className="type-name"
      onClick={(event) => {
        event.preventDefault();
        onClick(type, event);
      }}
      href="#"
    >
      {type?.name}
    </a>
  );
}
