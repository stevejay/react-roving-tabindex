import type { ReactNode } from "react";

export enum EventKey {
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  Home = "Home",
  End = "End"
}

export type KeyDirection = "horizontal" | "vertical" | "both";

export enum Navigation {
  PREVIOUS = "PREVIOUS",
  NEXT = "NEXT",
  VERY_FIRST = "VERY_FIRST",
  VERY_LAST = "VERY_LAST",
  PREVIOUS_ROW = "PREVIOUS_ROW",
  NEXT_ROW = "NEXT_ROW",
  FIRST_IN_ROW = "FIRST_IN_ROW",
  LAST_IN_ROW = "LAST_IN_ROW"
}

export type TabStop = Readonly<{
  id: string;
  domElementRef: React.RefObject<Element>;
  disabled: boolean;
  rowIndex: number | null;
}>;

export type RowStartMap = Map<Exclude<TabStop["rowIndex"], null>, number>;

export type State = Readonly<{
  selectedId: string | null;
  lastSelectedElement: { domElementRef: TabStop["domElementRef"] } | null;
  allowFocusing: boolean;
  tabStops: readonly TabStop[];
  direction: KeyDirection;
  rowStartMap: RowStartMap | null;
}>;

export enum ActionType {
  REGISTER_TAB_STOP = "REGISTER_TAB_STOP",
  UNREGISTER_TAB_STOP = "UNREGISTER_TAB_STOP",
  KEY_DOWN = "KEY_DOWN",
  CLICKED = "CLICKED",
  TAB_STOP_UPDATED = "TAB_STOP_UPDATED",
  DIRECTION_UPDATED = "DIRECTION_UPDATED",
  SET_INITIAL_TAB_ELEMENT = "SET_INITIAL_TAB_ELEMENT"
}

export type Action =
  | {
      type: ActionType.REGISTER_TAB_STOP;
      payload: TabStop;
    }
  | {
      type: ActionType.UNREGISTER_TAB_STOP;
      payload: { id: TabStop["id"] };
    }
  | {
      type: ActionType.TAB_STOP_UPDATED;
      payload: {
        id: TabStop["id"];
        rowIndex: TabStop["rowIndex"];
        disabled: TabStop["disabled"];
      };
    }
  | {
      type: ActionType.KEY_DOWN;
      payload: {
        id: TabStop["id"];
        key: EventKey;
        ctrlKey: boolean;
      };
    }
  | {
      type: ActionType.CLICKED;
      payload: { id: TabStop["id"] };
    }
  | {
      type: ActionType.DIRECTION_UPDATED;
      payload: { direction: KeyDirection };
    }
  | {
      type: ActionType.SET_INITIAL_TAB_ELEMENT;
      payload: { selector: string };
    };

export type Context = Readonly<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>;

export type ProviderProps = {
  children: ReactNode;
  direction?: KeyDirection;
  initialTabElementSelector?: string | null;
  onTabElementSelected?: (element: Element) => void;
};

export type HookResponse = [
  number,
  boolean,
  (event: React.KeyboardEvent) => void,
  () => void
];
