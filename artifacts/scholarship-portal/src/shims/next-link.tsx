import * as React from "react";
import { Link as WouterLink } from "wouter";

type NextLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
};

const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
  ({ href, prefetch, replace, scroll, shallow, passHref, legacyBehavior, children, ...rest }, ref) => {
    return (
      <WouterLink href={href ?? "#"} asChild>
        <a ref={ref} {...rest}>
          {children as React.ReactNode}
        </a>
      </WouterLink>
    );
  },
);
Link.displayName = "NextLinkShim";

export default Link;
