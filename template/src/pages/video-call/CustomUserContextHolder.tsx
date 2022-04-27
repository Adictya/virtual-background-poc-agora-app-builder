import React from 'react';
import {useFpe} from 'fpe-api';

const CustomUserContextHolder: React.FC<{children: any}> = (props) => {
  const useFpeCustomContext = useFpe((config) => config?.customUserContext);
  const Component = useFpeCustomContext ? useFpeCustomContext() : null;
  if (Component) {
    if (typeof Component === 'function') {
      return (
        <>
          <Component />
          {props.children}
        </>
      );
    } else if (Component.provider) {
      return <Component.provider>{props.children}</Component.provider>;
    } else {
      return props.children;
    }
  } else {
    return props.children;
  }
};
export default CustomUserContextHolder;
