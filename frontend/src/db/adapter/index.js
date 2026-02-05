import { Capacitor } from "@capacitor/core";
import * as indexedDb from "./indexedDb";
import * as sqliteDb from "./sqlite";

const isNative = Capacitor.isNativePlatform();

export const db = isNative ? sqliteDb : indexedDb;
