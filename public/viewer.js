window.onload = () => {
  document.getElementById('my-button').onclick = () => {
      init()
  }

  document.getElementById('send-message').onclick = (e) => {
    console.log('Clicked send message', e)
    var msg = document.getElementById('consumer-message').value

    console.log('msg:', msg)

    
    //sendChannel.send(text)
    console.log('setMessages(messages => [...messagees, {yours: true, value: text }])',  msg)
    msg = ''
    document.getElementById('consumer-message').value = msg
  }
}


function handleChange(value){
  console.log('Consumer:Viewer sent', value)
}

function sendMessage(){
  sendChannel.send(text)
  console.log('setMessages(messages => [...messagees, {yours: true, value: text }])')
}

async function init() {
  const peer = createPeer()
  console.log('peer: ', peer)

  //now we gotta create an offer
  peer.onicecandidate = e => console.log("Line 35: New Ice Candidate! reprinting SDP" + JSON.stringify(peer.localDescription))
  peer.onicecandidate = e => console.log("New Ice Candidate! from broadcaster reprinting SDP: ", peer.localDescription)
  //peer.createOffer().then(o => peer.setLocalDescription(o)).then(a=>console.log("set locally successfully for broadcast"))

  // The is where we create a pip like or channel between the two peers.
  //  Its a two way channel that goes from peer to peer.
  // This is a two way channel where you can kind of tell it what to do.
  // recvonly means we are only trying to receive info from the server.
  // This is called instea of addTrack
  
  peer.addTransceiver("video", { direction: "recvonly" })
  console.log('peer recvonly: ', peer);
  return peer


}

function createPeer() {
  const peer = new RTCPeerConnection({
      iceServers: [
          {
              urls: "stun:stun.stunprotocol.org"
          }
      ]
  });
  // The server is now sending us back the stream
  // The stream is the broadcasters stream
  peer.ontrack = handleTrackEvent
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer).then(a=> console.log("onnegotiationneeded peer.signalingState:", peer.signalingState ))
  console.log('peer: ', peer)

  return peer;   //Correct
}

async function handleNegotiationNeededEvent(incoming) {
  const offer = await incoming.createOffer()

  // offer.ondatachannel = (event) =>{
  //   sendChannel = event.channel
  //   sendChannel.onmessage = handleReceiveMessage
  //   console.log('send channel', sendChannel)
  // }

  await incoming.setLocalDescription(offer).then(a=> console.log("Set Successfully!"))
  const payload = {
      sdp: incoming.localDescription
  };
  
  console.log('payload', payload)

  const { data } = await axios.post('/consumer', payload)
  const desc = new RTCSessionDescription(data.sdp)

  // This is where the server accepts the offer.
  console.log('descitptionset Accepting offer: ', desc)
  incoming.setRemoteDescription(desc).catch(e => console.log(e))
  //return incoming; //<< Hack return
}

function handleTrackEvent(e) {
  //  This is where we take the video element 
  //  and the remote stream and attach it as a source object.
  //  Letting us see the boradcasters stream
  console.log('handleTrackEvent e: ', e)
  document.getElementById("video").srcObject = e.streams[0]
};
