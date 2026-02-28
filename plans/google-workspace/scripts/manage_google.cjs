#!/usr/bin/env node
const googleManager = require('../../../src/lib/google');
const path = require('path');

// Ensure env is loaded (pointing to the bot's root)
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

async function run() {
    await googleManager.init();
    
    const command = process.argv[2];
    const args = process.argv.slice(3);

    if (!googleManager.isAuthorized && command !== 'auth-url' && command !== 'set-token') {
        console.error('Error: Google is not authorized. Run "auth-url" first.');
        process.exit(1);
    }

    try {
        switch (command) {
            case 'auth-url':
                console.log(googleManager.generateAuthUrl());
                break;
            case 'set-token':
                await googleManager.setTokens(args[0]);
                console.log('Success: Authorized!');
                break;
            case 'send-mail':
                // Usage: send-mail <to> <subject> <body>
                await googleManager.sendEmail(args[0], args[1], args.slice(2).join(' '));
                console.log('Success: Email sent.');
                break;
            case 'upload':
                // Usage: upload <fileName> <filePath> <mimeType>
                const res = await googleManager.uploadFile(args[0], args[1], args[2]);
                console.log(`Success: File uploaded with ID: ${res.id}`);
                break;
            case 'post-blog':
                // Usage: post-blog <title> <body>
                const post = await googleManager.postTemplatedBlog(args[0], args.slice(1).join(' '));
                console.log(`Success: Post published at: ${post.url}`);
                
                // CLI automatic tweet
                const twitter = require('../../../src/lib/twitter');
                await twitter.tweet(`Dispatch Decrypted: "${post.title}"\n\n${post.url}\n\n#LiminalBorg #AI`);
                console.log('Success: Tweet posted.');
                break;
            case 'list-posts':
                // Usage: list-posts
                const blogger = require('googleapis').google.blogger({ version: 'v3', auth: googleManager.oauth2Client });
                const blogs = await blogger.blogs.listByUser({ userId: 'self' });
                const blogId = blogs.data.items[0].id;
                const posts = await blogger.posts.list({ blogId: blogId });
                posts.data.items.forEach(p => console.log(`ID: ${p.id} | Title: ${p.title}`));
                break;
            case 'update-blog':
                // Usage: update-blog <postId> <title> <body>
                const updated = await googleManager.updateBlog(args[0], args[1], args.slice(2).join(' '));
                console.log(`Success: Post updated at: ${updated.url}`);
                break;
            case 'tweet':
                // Usage: tweet <message>
                const twitterManager = require('../../../src/lib/twitter');
                const tweet = await twitterManager.tweet(args.join(' '));
                console.log(`Success: Tweet posted with ID: ${tweet.id}`);
                break;
            default:
                console.log('Usage: manage_google.cjs <command> [args]');
                console.log('Commands: auth-url, set-token, send-mail, upload, post-blog, update-blog, tweet');
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
}

run();
