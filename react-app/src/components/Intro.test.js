import React from 'react';
import { shallow, mount } from 'enzyme';
import Intro from './Intro';

describe('<Intro /> Component', () => {

  it('<Intro> Component', () => {
    const wrapper = shallow(<Intro />);
    expect(wrapper.find('.radio')).toHaveLength(2);
  });

});