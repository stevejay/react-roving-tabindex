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
  allowFocusing: boolean;
  tabStops: readonly TabStop[];
  direction: KeyDirection;
  focusOnClick: boolean;
  loopAround: boolean;
  rowStartMap: RowStartMap | null;
}>;

export type Options = Partial<
  Pick<State, "direction" | "focusOnClick" | "loopAround">
>;

export enum ActionType {
  REGISTER_TAB_STOP = "REGISTER_TAB_STOP",
  UNREGISTER_TAB_STOP = "UNREGISTER_TAB_STOP",
  KEY_DOWN = "KEY_DOWN",
  CLICKED = "CLICKED",
  TAB_STOP_UPDATED = "TAB_STOP_UPDATED",
  OPTIONS_UPDATED = "OPTIONS_UPDATED"
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
      type: ActionType.OPTIONS_UPDATED;
      payload: Options;
    };

export type Context = Readonly<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>;

export type HookResponse = [
  number,
  boolean,
  (event: React.KeyboardEvent) => void,
  () => void
];
