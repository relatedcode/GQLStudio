/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import React from 'react';
import MD from 'markdown-it';

const md = new MD({
  // render urls as links, à la github-flavored markdown
  linkify: true,
});

export default function MarkdownContent({ markdown, className }) {
  if (!markdown) {
    return <div />;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: md.render(markdown) }}
    />
  );
}
