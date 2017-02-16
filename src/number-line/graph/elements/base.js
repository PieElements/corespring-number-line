import React, { PropTypes as PT } from 'react';
import { Domain } from '../types';


export const basePropTypes = () => ({
  interval: PT.number.isRequired,
  domain: PT.instanceOf(Domain)
});