const { TwitterApi } = require('twitter-api-v2');
const config = require('../config');
const logger = require('../config/logger');

class TwitterManager {
    constructor() {
        this.client = new TwitterApi({
            appKey: config.twitter.appKey,
            appSecret: config.twitter.appSecret,
            accessToken: config.twitter.accessToken,
            accessSecret: config.twitter.accessSecret,
        });
        
        this.rwClient = this.client.readWrite;
    }

    async tweet(text) {
        if (config.shadowMode) {
            logger.info({ text }, 'SHADOW_MODE: Mocking tweet');
            return { id: 'mock_tweet_id', text };
        }
        try {
            logger.info({ text }, 'Attempting to post tweet');
            const { data: createdTweet } = await this.rwClient.v2.tweet(text);
            logger.info({ tweetId: createdTweet.id }, 'Tweet posted successfully');
            return createdTweet;
        } catch (e) {
            logger.error(e, 'Failed to post tweet');
            throw e;
        }
    }
}

module.exports = new TwitterManager();
