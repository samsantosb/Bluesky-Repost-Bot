"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const repost_1 = require("./repost");
const mentions_1 = require("./mentions");
const token_1 = require("./token");
require("dotenv/config");
const processedMentions = new Set();
const API_URL = "https://bsky.social/xrpc";
const ONE_MINUTE = 60000;
const ONE_HOUR = 3600000;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startTime = new Date().toLocaleTimeString();
            console.log(`Tick executed ${startTime}`);
            const { token, did } = yield (0, token_1.getAccessToken)();
            const { mentions } = yield (0, mentions_1.getMentions)(token);
            if (!mentions.length) {
                console.log("No mentions found");
                return;
            }
            for (const mention of mentions) {
                yield (0, repost_1.repost)(mention, token, did, processedMentions);
            }
        }
        catch (error) {
            console.error("Error:", error);
            process.exit(1);
        }
    });
}
main();
const mainInterval = setInterval(() => {
    main();
}, ONE_MINUTE);
const cleanupInterval = setInterval(() => {
    processedMentions.clear();
    console.log("Cleared processed mentions set");
}, ONE_HOUR);
