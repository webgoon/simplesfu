const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require('wrtc');
const PORT = 5000;

let senderStream;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//When a viewer is ready to start viewing the screen by clicking a button
//The person sends a post request down to this consumer endpoint

// They are gonna create an offer
// Send the offer down to the server
// The Server is gonna accept the offer
// The Server is gonna create an answer and send it back to them
// Hint this allows us to have a connection between the viewer and the server.

//  For every  addiontal person that wants to be a viewer of this particular stream
//  The server is gonna create a NEW peer object.
// This NEW peer object sole purpose is gonna be responsible for staying connected to that viewer.

app.post('/consumer', async ({ body }, res) => {
    console.log('Body consumer: ', body)
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });

    peer.ontrack = (e) => handleTrackEvent(e, peer);  //<< Not on his git hub

    const desc = new webrtc.RTCSessionDescription(body.sdp);
    console.log('Line 37: desc', desc)
    await peer.setRemoteDescription(desc);
    //This is where the sender stream is gonna be sending the incoming senderStrem  back out the other viewer
    //Whenever this is done we wanna use the addTrack method
    // Means we are taking the stream sent to the server by the broadcaster
    // on the other stream we are gonna be running the getTracks method.
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));

    console.log('Line 46: senderStream', senderStream)
    //console.log('Line 47: track', track)

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    console.log('consumer peer answered', peer);

    const payload = {
        sdp: peer.localDescription
    }

    return res.json(payload);
    
    //return;
});

app.post("/broadcast", async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    const datachannel = peer.createDataChannel("gooniechannel")
    datachannel.onmessage = e => console.log("just got a message" + e.data)
    datachannel.onopen = e => console.log("Copnnection Opened")

    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    
    await peer.setRemoteDescription(desc);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
    return;
});

// Here is where we are attaching the senders stream and attaching it to the senderStream variable
function handleTrackEvent(e, peer) {
    console.log('e.streams', e.streams[0])
    senderStream = e.streams[0];
    console.log('senderStream', senderStream)
    return senderStream;
   

};






//app.listen(5000, () => console.log('server started'));
app.listen(PORT, () => console.log(`server started on port ${PORT} http://localhost:${PORT}/`));

// run command node server.js
