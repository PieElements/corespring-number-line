import React, { PropTypes as PT } from 'react';


export const basePropTypes = () => ({
  interval: PT.number.isRequired,
  domain: PT.shape({
    min: PT.number.isRequired,
    max: PT.number.isRequired
  })
});