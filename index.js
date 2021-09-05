'use strict';

import WebSocket from 'ws';
import fetch from 'node-fetch';

const sipf_url    = 'wss://api.sakura.io/ws/v1/cloud/';
const soracom_url = 'https://api.soracom.io/v1/devices/';

const ws = new WebSocket(sipf_url + process.env.SIPF_TOKEN);

ws.on('message', async function incoming(message) {
    const message_obj = JSON.parse(message);
    if (message_obj.type !== 'keepalive') {
        console.log('received: %s', message);

        const body = JSON.stringify(makeSoracomBody(message_obj.payload));
        if (process.env.DEBUG) console.log('request body: %s', body);
        const response = await fetch(soracom_url + process.env.SORACOM_DEVICE_ID + '/publish', {
            method: 'post',
            body: body,
            headers: {
                'Content-Type': 'application/json',
                'x-device-secret': process.env.SORACOM_DEVICE_SECRET,
                'x-soracom-timestamp': message_obj.timestamp_platform_from_src
            }
        });
        const response_body = await response.text();
        if (process.env.DEBUG) console.log(response_body);
    } else {
        if (process.env.DEBUG) console.log('keepalive received: %s', message_obj.datetime);
    }
});

process.on('SIGINT', function() {
    process.exit();
});

function makeSoracomBody(payload) {
    let body = {};
    switch(payload[0].tag) {
        case '01':
            body.temp = payload[0].value;
            break;
        case '02':
            body.eco2 = payload[0].value;
            break;
        case '03':
            body.message = payload[0].value;
            break;
    }
    return body;
}