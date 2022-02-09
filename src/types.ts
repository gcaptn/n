import type {
  BroadcastFromServer,
  EventBetweenServers,
  EventFromClient,
  EventFromServer,
  FunctionFromServer,
  LocalEvent,
  LocalFunction,
} from "./classes";

export type Callback = (...args: unknown[]) => void;
export type CallbackWithPlayer = (player: Player, ...args: unknown[]) => void;

export type Def = { kind: string; args: unknown[] };
export type Definitions = Record<string, Def>;

export type ClassParameters<T> = T extends new (
  id: string,
  ...args: infer U
) => any // eslint-disable-line @typescript-eslint/no-explicit-any
  ? U
  : never;

export type ClassDef<T extends string, U> = {
  kind: T;
  args: ClassParameters<U>;
};

export type LocalEventDef<_T extends unknown[]> = ClassDef<
  "LocalEvent",
  typeof LocalEvent
>;

export type LocalFunctionDef<_T extends Callback> = ClassDef<
  "LocalFunction",
  typeof LocalFunction
>;

export type EventFromServerDef<_T extends unknown[]> = ClassDef<
  "EventFromServer",
  typeof EventFromServer
>;

export type EventFromClientDef<_T extends unknown[]> = ClassDef<
  "EventFromClient",
  typeof EventFromClient
>;

export type FunctionFromServerDef<_T extends CallbackWithPlayer> = ClassDef<
  "FunctionFromServer",
  typeof FunctionFromServer
>;

export type BroadcastFromServerDef<_T extends unknown[]> = ClassDef<
  "BroadcastFromServer",
  typeof BroadcastFromServer
>;

export type EventBetweenServersOpts = { topicPrefix?: string };
export type EventBetweenServersDef<_T> = ClassDef<
  "EventBetweenServers",
  typeof EventBetweenServers
>;

export type InferDefType<T> = T extends LocalEventDef<infer U>
  ? LocalEvent<U>
  : T extends LocalFunctionDef<infer U>
  ? LocalFunction<U>
  : T extends EventFromServerDef<infer U>
  ? EventFromServer<U>
  : T extends EventFromClientDef<infer U>
  ? EventFromClient<U>
  : T extends FunctionFromServerDef<infer U>
  ? FunctionFromServer<U>
  : T extends BroadcastFromServerDef<infer U>
  ? BroadcastFromServer<U>
  : T extends EventBetweenServersDef<infer U>
  ? EventBetweenServers<U>
  : never;

export type NetworkMap<T extends Definitions> = {
  [K in keyof T]: InferDefType<T[K]>;
};

// use this instead of lua tuples for better type checking
// (e.g. using "if (result.success)" and making typescript
// use the successful variant doesn't work on a LuaTuple)
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

// return a table in the transpiled code
/** @private */
export const _ = "";
