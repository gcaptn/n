import { getContext } from "./context";

const FOLDER_NAME = "NetworkFolder";
const FOLDER = (() => {
  let folder = script.FindFirstChild(FOLDER_NAME);
  if (!folder) {
    if (getContext() === "server") {
      folder = new Instance("Folder");
      folder.Name = FOLDER_NAME;
      folder.Parent = script;
    } else {
      folder = script.WaitForChild(FOLDER_NAME);
    }
  }
  return folder as Folder;
})();

const bindableClassMap = {
  LocalFunction: "BindableFunction",
  LocalEvent: "BindableEvent",
  BroadcastFromServer: "BindableEvent",
} as const;

const remoteClassMap = {
  EventFromServer: "RemoteEvent",
  EventFromClient: "RemoteEvent",
  FunctionFromServer: "RemoteFunction",
  BroadcastFromServer: "RemoteEvent",
} as const;

type BindableClassMap = {
  LocalFunction: BindableFunction;
  LocalEvent: BindableEvent;
  BroadcastFromServer: BindableEvent;
};

type RemoteClassMap = {
  EventFromServer: RemoteEvent;
  EventFromClient: RemoteEvent;
  FunctionFromServer: RemoteFunction;
  BroadcastFromServer: RemoteEvent;
};

export type BindableClassKinds = keyof typeof bindableClassMap;
export type RemoteClassKinds = keyof typeof remoteClassMap;

const getBindableName = (kind: string, id: string) =>
  `${getContext()}_bindable_${kind}_${id}`;

const getRemoteName = (kind: string, id: string) => `remote_${kind}_${id}`;

export function findBindable<K extends keyof BindableClassMap>(
  kind: K,
  id: string
): BindableClassMap[K] {
  const bindableName = getBindableName(kind, id);
  const bindable = FOLDER.FindFirstChild(bindableName);
  if (bindable) return bindable as BindableClassMap[K];

  const newBindable = new Instance(bindableClassMap[kind]);
  newBindable.Name = bindableName;
  newBindable.Parent = FOLDER;
  return newBindable as BindableClassMap[K];
}

export function findRemote<K extends keyof RemoteClassMap>(
  kind: K,
  id: string
): RemoteClassMap[K] {
  const remoteName = getRemoteName(kind, id);
  const remote = FOLDER.FindFirstChild(remoteName);
  if (remote) return remote as RemoteClassMap[K];

  const newRemote = new Instance(remoteClassMap[kind]);
  newRemote.Name = remoteName;
  newRemote.Parent = FOLDER;
  return newRemote as RemoteClassMap[K];
}

export function isBindableClass(kind: string): kind is BindableClassKinds {
  return bindableClassMap[kind as BindableClassKinds] !== undefined;
}

export function isRemoteClass(kind: string): kind is RemoteClassKinds {
  return remoteClassMap[kind as RemoteClassKinds] !== undefined;
}

export function alreadyCreated(
  kind: BindableClassKinds | RemoteClassKinds,
  id: string
) {
  if (isRemoteClass(kind) && getContext() === "server") {
    return FOLDER.FindFirstChild(getRemoteName(kind, id)) !== undefined;
  } else if (isBindableClass(kind)) {
    return FOLDER.FindFirstChild(getBindableName(kind, id)) !== undefined;
  } else {
    return false;
  }
}
