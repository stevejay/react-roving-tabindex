import React, { FC, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import styled from 'styled-components';
// import useOnclickOutside from "react-cool-onclickoutside";
import useOnClickOutside from 'use-onclickoutside';

import { ProviderAPI, ProviderProps, RovingTabIndexProvider, useRovingTabIndex } from '..';
import { Button } from './button';

const MenuBarProvider = (props: ProviderProps) => (
  <RovingTabIndexProvider {...props} direction="horizontal" />
);

// eslint-disable-next-line react/display-name
const MenuDropdownProvider = forwardRef<ProviderAPI, ProviderProps>(({ children }, ref) => (
  <RovingTabIndexProvider ref={ref} direction="vertical">
    {children}
  </RovingTabIndexProvider>
));

const useMenuToggle = (isNested: boolean) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleRef = useRef<any>(null);
  const dropdownRef = useRef<React.ElementRef<typeof MenuDropdownProvider> | null>(null);

  const [show, setShow] = useState<boolean>(false);
  const [tabIndex, handleKeyDown, handleClick, select] = useRovingTabIndex(toggleRef, false);

  const setShowFalse = useCallback(() => setShow(false), []);
  useOnClickOutside(containerRef, setShowFalse);

  const onToggleKeyDown = useCallback(
    (event: React.KeyboardEvent<Element>) => {
      let consumed = false;
      if (event.key === ' ' || event.key === 'Enter') {
        setShow(true);
        dropdownRef.current && dropdownRef.current.selectTabElementByPosition('first');
        consumed = true;
      } else if (
        (!isNested && event.key === 'ArrowDown') ||
        (isNested && event.key === 'ArrowRight')
      ) {
        setShow(true);
        dropdownRef.current && dropdownRef.current.selectTabElementByPosition('first');
        consumed = true;
      } else if (
        (!isNested && event.key === 'ArrowUp') ||
        (isNested && event.key === 'ArrowLeft')
      ) {
        setShow(true);
        dropdownRef.current && dropdownRef.current.selectTabElementByPosition('last');
        consumed = true;
      }
      if (consumed) {
        event.stopPropagation();
      } else {
        handleKeyDown(event);
      }
    },
    [handleKeyDown, dropdownRef, isNested]
  );

  const onToggleClick = useCallback(
    (event) => {
      setShow((prev) => !prev);
      handleClick();
      event.stopPropagation(); // important!
    },
    [handleClick]
  );

  const toggleProps = useMemo(
    () => ({
      ref: toggleRef,
      'aria-expanded': show,
      'aria-haspopup': true,
      role: 'menuitem',
      tabIndex,
      onClick: onToggleClick,
      onKeyDown: onToggleKeyDown,
    }),
    [show, tabIndex, onToggleClick, onToggleKeyDown]
  );

  const dropdownProviderProps = useMemo(
    () => ({
      ref: dropdownRef,
    }),
    [] // ???
  );

  const containerProps = useMemo(
    () => ({
      ref: containerRef,
      onMouseOver: () => setShow(true),
      onMouseOut: () => setShow(false),
      onClick: () => {
        setShow(false);
        toggleRef.current && select();
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Escape') {
          setShow(false);
          toggleRef.current && select();
          if (event.target !== toggleRef.current) {
            event.stopPropagation(); // important! We only close the most immediate menu.
          }
        } else if (event.key === 'Tab') {
          setShow(false);
        }
      },
    }),
    [select]
  );

  return { toggleProps, dropdownProviderProps, containerProps, show };
};

const StyledMenuItem = styled.a`
  border-width: 2px;
  border-color: transparent;
  white-space: nowrap;
  &:hover {
    background-color: rgb(218, 222, 226);
  }
`;

const useMenuItem = <ElementT extends HTMLElement>() => {
  const ref = useRef<ElementT>(null);
  const [tabIndex, onKeyDown, onClick] = useRovingTabIndex(ref, false);
  const props = useMemo(
    () => ({
      tabIndex,
      onKeyDown,
      onClick,
      ref,
      role: 'menuitem',
    }),
    [tabIndex, onKeyDown, onClick]
  );
  return props;
};

type MenuItemProps = { label: string };

const MenuItem: FC<MenuItemProps> = ({ label }) => {
  const menuItemProps = useMenuItem<HTMLAnchorElement>();
  return (
    <li role="none">
      <StyledMenuItem href={`#${label}`} {...menuItemProps}>
        {label}
      </StyledMenuItem>
    </li>
  );
};

const StyledMenuContainer = styled.li`
  position: relative;
`;

const StyledMenuToggle = styled.button`
  border-width: 2px;
  border-color: transparent;
  white-space: nowrap;
  &:hover {
    background-color: rgb(218, 222, 226);
  }
`;

type StyledDropdownMenuContainerProps = {
  show: boolean;
  isNested?: boolean;
};

const StyledMenuDropdownContainer = styled.ul`
  display: ${(props: StyledDropdownMenuContainerProps) => (props.show ? 'flex' : 'none')};
  position: absolute;
  flex-direction: column;
  background-color: rgb(248, 249, 250);
  left: ${(props: StyledDropdownMenuContainerProps) => (props.isNested ? '100%' : 0)};
  top: ${(props: StyledDropdownMenuContainerProps) => (props.isNested ? 0 : '100%')};
`;

type MenuProps = {
  label: string;
  isNested?: boolean;
};

const Menu: FC<MenuProps> = ({ children, label, isNested = false }) => {
  const { toggleProps, dropdownProviderProps, containerProps, show } = useMenuToggle(isNested);
  return (
    <StyledMenuContainer role="none" {...containerProps}>
      <StyledMenuToggle {...toggleProps}>
        {label}
        {isNested ? ' →' : ' ↓'}
      </StyledMenuToggle>
      <MenuDropdownProvider {...dropdownProviderProps}>
        <StyledMenuDropdownContainer role="menu" aria-label={label} show={show} isNested={isNested}>
          {children}
        </StyledMenuDropdownContainer>
      </MenuDropdownProvider>
    </StyledMenuContainer>
  );
};

const StyledMenuBar = styled.ul`
  display: flex;
  gap: 1rem;
  margin: 10px;
  padding: 10px;
  background-color: #eee;
`;

const MenuItemSeparator = styled.div`
  border-bottom: 1px solid gray;
  padding-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

const StyledExampleContainer = styled.div`
  display: flex;
  flex-direction: column;
  & > * + * {
    margin-top: 1rem;
  }
`;

export const NestedMenuBar: FC = () => (
  <StyledExampleContainer>
    <Button>Something before to focus on</Button>
    <nav aria-label="Mythical University">
      <MenuBarProvider>
        <StyledMenuBar aria-label="Mythical University" role="menubar">
          <Menu label="About">
            <MenuItem label="About 1" />
            <MenuItemSeparator />
            <MenuItem label="About 2" />
          </Menu>
          <Menu label="Admissions">
            <MenuItem label="Admissions 1" />
            <MenuItem label="Admissions 2" />
          </Menu>
          <Menu label="Academics">
            <MenuItem label="Academics 1" />
            <MenuItemSeparator />
            <Menu label="Academics 2" isNested>
              <MenuItem label="Academics 2.1" />
              <MenuItem label="Academics 2.2" />
              <Menu label="Academics 2.3" isNested>
                <MenuItem label="Academics 2.3.1" />
                <MenuItem label="Academics 2.3.2" />
              </Menu>
            </Menu>
            <MenuItem label="Academics 3" />
          </Menu>
          <MenuItem label="Foo 1" />
        </StyledMenuBar>
      </MenuBarProvider>
    </nav>
    <Button>Something after to focus on</Button>
  </StyledExampleContainer>
);

export default {
  title: 'Nested MenuBar RovingTabIndex',
} as Meta;
