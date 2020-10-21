export enum EventKey {
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  Home = "Home",
  End = "End"
}

export enum Key {
  ARROW_LEFT = "ArrowLeft",
  ARROW_RIGHT = "ArrowRight",
  ARROW_UP = "ArrowUp",
  ARROW_DOWN = "ArrowDown",
  HOME = "Home",
  END = "End",
  HOME_WITH_CTRL = "HomeWithCtrl",
  END_WITH_CTRL = "EndWithCtrl"
}

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

export type KeyConfig = {
  [Key.ARROW_LEFT]?: Navigation.PREVIOUS | null;
  [Key.ARROW_RIGHT]?: Navigation.NEXT | null;
  [Key.ARROW_UP]?: Navigation.PREVIOUS | Navigation.PREVIOUS_ROW | null;
  [Key.ARROW_DOWN]?: Navigation.NEXT | Navigation.NEXT_ROW | null;
  [Key.HOME]?: Navigation.VERY_FIRST | Navigation.FIRST_IN_ROW | null;
  [Key.END]?: Navigation.VERY_LAST | Navigation.LAST_IN_ROW | null;
  [Key.HOME_WITH_CTRL]?: Navigation.VERY_FIRST | null;
  [Key.END_WITH_CTRL]?: Navigation.VERY_LAST | null;
};

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
  keyConfig: KeyConfig;
  rowStartMap: RowStartMap | null;
}>;

export enum ActionType {
  REGISTER_TAB_STOP = "REGISTER_TAB_STOP",
  UNREGISTER_TAB_STOP = "UNREGISTER_TAB_STOP",
  KEY_DOWN = "KEY_DOWN",
  CLICKED = "CLICKED",
  TAB_STOP_UPDATED = "TAB_STOP_UPDATED",
  KEY_CONFIG_UPDATED = "KEY_CONFIG_UPDATED"
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
      type: ActionType.KEY_CONFIG_UPDATED;
      payload: { keyConfig: KeyConfig };
    };

export type Context = Readonly<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>;

export type HookOptions = { id?: string; rowIndex?: number };

export type HookResponse = [
  number,
  boolean,
  (event: React.KeyboardEvent) => void,
  () => void
];
