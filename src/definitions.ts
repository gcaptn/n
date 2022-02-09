import {
  BroadcastFromServerDef,
  Callback,
  CallbackWithPlayer,
  Def,
  Definitions,
  EventBetweenServersDef,
  EventBetweenServersOpts,
  EventFromClientDef,
  EventFromServerDef,
  FunctionFromServerDef,
  InferDefType,
  LocalEventDef,
  LocalFunctionDef,
  NetworkMap,
} from "./types";
import { classMap } from "./classes";
import { isBindableClass, isRemoteClass, alreadyCreated } from "find";

function create<T extends Def>(id: string, definition: T): InferDefType<T> {
  if (
    (isBindableClass(definition.kind) || isRemoteClass(definition.kind)) &&
    alreadyCreated(definition.kind, id)
  ) {
    throw error(`${definition.kind} "${id}" already exists!`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (classMap[definition.kind as keyof typeof classMap] as any)(
    id,
    ...definition.args
  );
}

/** Define a map of networking classes */
export function Define<T extends Definitions>(definitions: T) {
  const map = {} as Record<string, unknown>;
  // pairs() does not resolve T
  for (const [k, v] of pairs(definitions)) {
    map[k as string] = create(k as string, v as Def);
  }
  return map as unknown as NetworkMap<T>;
}

/** Equivalent of a BindableEvent */
export function LocalEvent<T extends unknown[]>(): LocalEventDef<T> {
  return { kind: "LocalEvent", args: [] };
}

/** Equivalent of a BindableFunction */
export function LocalFunction<T extends Callback>(): LocalFunctionDef<T> {
  return { kind: "LocalFunction", args: [] };
}

/** A remote event fired from server to clients */
export function EventFromServer<T extends unknown[]>(): EventFromServerDef<T> {
  return { kind: "EventFromServer", args: [] };
}

/** A remote event fired from clients to server */
export function EventFromClient<T extends unknown[]>(): EventFromClientDef<T> {
  return { kind: "EventFromClient", args: [] };
}

/** A server remote function invoked by clients */
export function FunctionFromServer<
  T extends CallbackWithPlayer
>(): FunctionFromServerDef<T> {
  return { kind: "FunctionFromServer", args: [] };
}

/** A signal fired by the server to both clients and the server */
export function BroadcastFromServer<
  T extends unknown[]
>(): BroadcastFromServerDef<T> {
  return { kind: "BroadcastFromServer", args: [] };
}

/** A cross-server event with MessagingService **/
export function EventBetweenServers<T>(
  opts?: EventBetweenServersOpts
): EventBetweenServersDef<T> {
  return { kind: "EventBetweenServers", args: [opts] };
}
