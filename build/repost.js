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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repost = repost;
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
function repost(mention, token, did, processedMentions) {
    return __awaiter(this, void 0, void 0, function* () {
        if (processedMentions.has(mention.cid)) {
            console.log(`Already reposted: ${mention.cid}`);
            return { message: "Already reposted", data: null };
        }
        console.log(`Reposting: ${mention.cid}`);
        const repostData = {
            $type: "app.bsky.feed.repost",
            repo: did,
            collection: "app.bsky.feed.repost",
            record: {
                subject: {
                    uri: mention.uri,
                    cid: mention.cid,
                },
                createdAt: new Date().toISOString(),
            },
        };
        const { data } = yield axios_1.default.post(`${process.env.API_URL}/com.atproto.repo.createRecord`, repostData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        processedMentions.add(mention.cid);
        return { message: "Reposted successfully", data };
    });
}
