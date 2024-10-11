import React from "react";

/**
 * A component that renders an icon (i.e., an SVG) with a color that matches the parent's text color.
 */
export default function ParentStrokeIcon(props: { icon: JSX.Element }) {
  return React.cloneElement(props.icon, {
    className: "stroke-current",
  });
}
