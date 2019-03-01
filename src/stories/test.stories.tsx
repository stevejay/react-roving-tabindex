// import { noop } from "lodash";
import React from "react";
// import { host } from "storybook-host";
import { storiesOf } from "@storybook/react";
// import Button, { ButtonType } from "../button";

// const buttonHost = host({
//   align: "center middle",
//   backdrop: "transparent"
// });

storiesOf("Button", module)
  // .addDecorator(buttonHost)
  .add("Text", () => <button>Some text</button>);
