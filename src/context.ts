import { RunService } from "@rbxts/services";

export type Context = "server" | "client";

export function getContext(): Context {
  if (RunService.IsServer()) return "server";
  return "client";
}

function assertContext(context: Context) {
  return (method: string) =>
    assert(
      getContext() === context,
      method + " can only be called from the server"
    );
}

export const assertServer = assertContext("server");
export const assertClient = assertContext("client");
