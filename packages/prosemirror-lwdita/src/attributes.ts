/*!
Copyright (C) 2020 Evolved Binary

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * Common attributes for all media nodes
 */
export const commonAttributes = {
  // %localization;
  dir: undefined,
  "xml:lang": undefined,
  translate: undefined,

  // classes
  outputclass: undefined,
  class: undefined,
};

/**
 * Attributes for image nodes
 */
export const imageAttributes = {
  ...commonAttributes,
  height: undefined,
  width: undefined,
  keyref: undefined,

  // %reference-content;
  href: undefined,
  format: undefined,
  scope: undefined,
};

/**
 * Attributes for audio nodes
 */
export const audioAttributes = {
  ...commonAttributes,
  autoplay: undefined,
  controls: undefined,
  loop: undefined,
  muted: undefined,
  tabindex: undefined,
  keyref: undefined,

  // %reference-content;
  href: undefined,
  format: undefined,
  scope: undefined,

  // %filters;
  props: undefined,

  // %reuse;
  id: undefined,
  conref: undefined,
};

/**
 * Attributes for video nodes
 */
export const videoAttributes = {
  ...commonAttributes,
  autoplay: undefined,
  controls: undefined,
  loop: undefined,
  muted: undefined,
  tabindex: undefined,
  height: undefined,
  width: undefined,

  // %reference-content;
  href: undefined,
  format: undefined,
  scope: undefined,

  // %filters;
  props: undefined,

  // %reuse;
  id: undefined,
  conref: undefined,
};

/**
 * Attributes for fallback nodes
 */
export const fallbackAttributes = {
  ...commonAttributes,
  props: undefined,
}

/**
 * Attributes for video-poster nodes
 */
export const videoPosterAttributes = {
  ...commonAttributes,
  href: undefined,
}

/**
 * Attributes for media-source nodes
 */
export const mediaSourceAttributes = {
  ...commonAttributes,
  keyref: undefined,

  // %reference-content;
  href: undefined,
  format: undefined,
  scope: undefined,
}

/**
 * Attributes for media-track nodes
 */
export const mediaTrackAttributes = {
  ...commonAttributes,

  // %reference-content;
  href: undefined,
  format: undefined,
  scope: undefined,

  keyref: undefined,
  kind: undefined,
  srclang: undefined,
}

/**
 * Attributes for desc nodes
 */
export const descAttributes = {
  props: undefined,
  ...commonAttributes,
}


