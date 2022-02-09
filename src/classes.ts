import { MessagingService } from "@rbxts/services";
import { assertClient, assertServer, getContext } from "./context";
import { findBindable, findRemote } from "./find";
import {
  Callback,
  CallbackWithPlayer,
  EventBetweenServersOpts,
  Result,
} from "./types";

/** Equivalent of a BindableEvent */
export class LocalEvent<T extends unknown[]> {
  private bindable: BindableEvent;

  constructor(id: string) {
    this.bindable = findBindable("LocalEvent", id);
  }

  Connect(handler: (...args: T) => void) {
    return this.bindable.Event.Connect(handler);
  }

  Wait() {
    this.bindable.Event.Wait();
  }

  Fire(...args: T) {
    return this.bindable.Fire(...args);
  }
}

/** Equivalent of a BindableFunction */
export class LocalFunction<T extends Callback> {
  private bindable: BindableFunction;

  constructor(id: string) {
    this.bindable = findBindable("LocalFunction", id);
  }

  Handle(handler: T) {
    this.bindable.OnInvoke = handler;
  }

  Invoke(...args: Parameters<T>): ReturnType<T> {
    return this.bindable.Invoke(...args);
  }
}

/** A remote event fired from server to clients */
export class EventFromServer<T extends unknown[]> {
  private remote: RemoteEvent;

  constructor(id: string) {
    this.remote = findRemote("EventFromServer", id);
  }

  Connect(handler: (...args: T) => void) {
    assertClient("EventFromServer.Connect");
    return this.remote.OnClientEvent.Connect(handler);
  }

  Wait() {
    assertClient("EventFromServer.Wait");
    this.remote.OnClientEvent.Wait();
  }

  FireFor(player: Player, ...args: T) {
    assertServer("EventFromServer.FireFor");
    this.remote.FireClient(player, ...args);
  }

  FireForAll(...args: T) {
    assertServer("EventFromServer.FireForAll");
    this.remote.FireAllClients(...args);
  }
}

/** A remote event fired from clients to server */
export class EventFromClient<T extends unknown[]> {
  private remote: RemoteEvent;

  constructor(id: string) {
    this.remote = findRemote("EventFromClient", id);
  }

  Connect(handler: (player: Player, ...args: unknown[]) => void) {
    assertServer("EventFromClient.Connect");
    return this.remote.OnServerEvent.Connect(handler);
  }

  Wait() {
    assertClient("EventFromClient.Wait");
    this.remote.OnServerEvent.Wait();
  }

  Fire(...args: T) {
    assertClient("EventFromClient.Fire");
    this.remote.FireServer(...args);
  }
}

/** A server remote function invoked by clients */
export class FunctionFromServer<T extends CallbackWithPlayer> {
  private remote: RemoteFunction;

  constructor(id: string) {
    this.remote = findRemote("FunctionFromServer", id);
  }

  Handle(handler: T) {
    assertServer("FunctionFromServer.Handle");
    this.remote.OnServerInvoke = handler;
  }

  Invoke(...args: Parameters<T>): ReturnType<T> {
    assertClient("FunctionFromServer.Invoke");
    return this.remote.InvokeServer(...args);
  }
}

/** A signal fired by the server to both clients and the server */
export class BroadcastFromServer<T extends unknown[]> {
  private remote: RemoteEvent;
  private bindable: BindableEvent;

  constructor(id: string) {
    this.remote = findRemote("BroadcastFromServer", id);
    this.bindable = findBindable("BroadcastFromServer", id);
  }

  Connect(handler: (...args: T) => void) {
    if (getContext() === "server") {
      return this.bindable.Event.Connect(handler);
    } else {
      return this.remote.OnClientEvent.Connect((...args) =>
        handler(...(args as T))
      );
    }
  }

  Wait() {
    if (getContext() === "server") {
      this.bindable.Event.Wait();
    } else {
      this.remote.OnClientEvent.Wait();
    }
  }

  FireFor(player: Player, ...args: T) {
    assertServer("BroadcastFromServer.FireFor");
    this.bindable.Fire(...args);
    this.remote.FireClient(player, ...args);
  }

  FireForAll(...args: T) {
    assertServer("BroadcastFromServer.FireForAll");
    this.bindable.Fire(...args);
    this.remote.FireAllClients(...args);
  }
}

/** A cross-server event with MessagingService **/
export class EventBetweenServers<T> {
  private topic: string;
  constructor(id: string, opts: EventBetweenServersOpts = {}) {
    this.topic =
      (opts.topicPrefix === undefined ? "CROSS_SERVER_" : opts.topicPrefix) +
      id;
  }

  TrySubscribe(
    handler: (data: T) => void
  ): Result<RBXScriptConnection, string> {
    const [success, connection] = pcall(() =>
      MessagingService.SubscribeAsync(this.topic, (value) =>
        handler((value as { Data: T }).Data)
      )
    );
    if (!success) return { success, error: connection as string };
    return { success, value: connection as RBXScriptConnection };
  }

  TryPublish(data: T): Result<undefined, string> {
    const [success, value] = pcall(() => {
      return MessagingService.PublishAsync(this.topic, data);
    });
    if (!success) return { success, error: value as string };
    return { success, value: undefined };
  }
}

export const classMap = {
  LocalEvent,
  LocalFunction,
  EventFromServer,
  EventFromClient,
  FunctionFromServer,
  BroadcastFromServer,
  EventBetweenServers,
} as const;
