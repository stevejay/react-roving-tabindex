import "jspolyfill-array.prototype.findIndex";
import isHotkey from "is-hotkey";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { Editor, createEditor, Node } from "slate";
import { Meta } from "@storybook/react/types-6-0";
import { RovingTabIndexProvider, useRovingTabIndex, useFocusEffect } from "..";
import { Button } from "./button";
import { Toolbar } from "./toolbar";

// The code in this file largely comes from the rich text editor example in the Slate docs:
// https://github.com/ianstormtaylor/slate/blob/master/site/examples/richtext.tsx

const initialValue = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" }
    ]
  }
];

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const MarkButton = ({ format, label }) => {
  const editor = useSlate();
  return (
    <ToolbarButton
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {label}
    </ToolbarButton>
  );
};

type ButtonClickHandler = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => void;

const ToolbarButton: FC<{
  disabled?: boolean;
  onClick?: ButtonClickHandler;
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}> = ({ disabled = false, children, onClick, onMouseDown }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown] = useRovingTabIndex(ref, disabled);

  useFocusEffect(focused, ref);

  return (
    <Button
      ref={ref}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => {
        onMouseDown(event);
      }}
      onClick={onClick}
      tabIndex={tabIndex}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export const GridExample: FC = () => {
  const [value, setValue] = useState<Node[]>(initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <Toolbar role="toolbar">
        <RovingTabIndexProvider>
          <MarkButton format="bold" label="Bold" />
          <MarkButton format="italic" label="Italic" />
          <MarkButton format="underline" label="Underline" />
        </RovingTabIndexProvider>
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

export default {
  title: "Text Editor RovingTabIndex",
  component: GridExample
} as Meta;
