window.onload = () => {
  document.getElementById('my-button').onclick = () => {
      init();
  }
}

async function init() {
  const peer = createPeer();
  console.log('peer: ', peer);

  // The is where we create a pip like or channel between the two peers.
  //  Its a two way channel that goes from peer to peer.
  // This is a two way channel where you can kind of tell it what to do.
  // recvonly means we are only trying to receive info from the server.
  // This is called instea of addTrack
  
  peer.addTransceiver("video", { direction: "recvonly" })
  console.log('peer recvonly: ', peer);
  return peer;


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
  peer.ontrack = handleTrackEvent;
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
  console.log('peer: ', peer);

  return peer;   //Correct
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
      sdp: peer.localDescription
  };
  
  console.log('payload', payload);

  const { data } = await axios.post('/consumer', payload);
  const desc = new RTCSessionDescription(data.sdp);

  // This is where the server accepts the offer.
  console.log('descitptionset Accepting offer: ', desc)
  peer.setRemoteDescription(desc).catch(e => console.log(e));
  //return peer; //<< Hack return
}

function handleTrackEvent(e) {
  //  This is where we take the video element 
  //  and the remote stream and attach it as a source object.
  //  Letting us see the boradcasters stream
  console.log('handleTrackEvent e: ', e);
  document.getElementById("video").srcObject = e.streams[0];
};
