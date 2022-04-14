//intialize rtc

const configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
};

const peerConnection = new RTCPeerConnection(configuration);



const createRoomButton = document.querySelector('#create');
const joinRoomButton = document.querySelector('#join');
const connectButton = document.querySelector('#connect');
const answerInput = document.querySelector('#answerInput');
const roomAnswerDiv = document.querySelector('#roomAnswerDiv');
const roomDetailsParagraphElement = document.querySelector('#roomSDP');
const messsageBoxDiv = document.querySelector('#messageBox');
const messageInput = document.querySelector('#message');
const sendMessageButton = document.querySelector('#sendMsgBtn');

createRoomButton.addEventListener('click', createRoom);
joinRoomButton.addEventListener('click', joinRoom);
connectButton.addEventListener('click', connect);
sendMessageButton.addEventListener('click', sendMsg);

async function createRoom() {
    const dataChannel = peerConnection.createDataChannel("channel1");
    peerConnection.channel = dataChannel;
    createRoomButton.disabled = true;
    joinRoomButton.disabled = true;
    roomAnswerDiv.style.display = 'block';

    dataChannel.onmessage = receiveMsg;

    dataChannel.onopen = () => {
        console.log("Connection Opened");
    }

    dataChannel.onclose = () => {
        console.log("Datachannel closed");
    }
    peerConnection.onicecandidate = () => {
        console.log("New Ice Candidate! reprinting SDP" + JSON.stringify(peerConnection.localDescription));
        roomDetailsParagraphElement.innerText = JSON.stringify(peerConnection.localDescription);
    }
    
    let offer = await peerConnection.createOffer();
   
    peerConnection.setLocalDescription(offer);
}

function connect() {
    connectButton.disabled = true;
    const offer = JSON.parse(answerInput.value);
    peerConnection.setRemoteDescription (offer).then(a=>console.log("done"))
}

async function joinRoom() {
    peerConnection.onicecandidate = () => {
        console.log("New Ice Candidate! reprinting SDP" + JSON.stringify(peerConnection.localDescription));
        roomDetailsParagraphElement.innerText = JSON.stringify(peerConnection.localDescription);
    }
    peerConnection.ondatachannel= dataChannel => {

        const receiveChannel = dataChannel.channel;
        receiveChannel.onmessage = receiveMsg;
        receiveChannel.onopen = e => console.log("open!!!!");
        receiveChannel.onclose = e => console.log("closed!!!!!!");
        peerConnection.channel = receiveChannel;
    }
    const offer = JSON.parse(answerInput.value)
    peerConnection.setRemoteDescription(offer).then(a=>console.log("done"));

    await peerConnection.createAnswer().then(a => peerConnection.setLocalDescription(a)).then(a=>
        console.log(JSON.stringify(peerConnection.localDescription)))
}

function sendMsg() {
    const msg = messageInput.value;
    peerConnection.channel.send(msg);
    var messageElement = document.createElement("p");
    var text = document.createTextNode("Me: " + messageInput.value);
    messageElement.appendChild(text);
    messsageBoxDiv.appendChild(messageElement);
}

function receiveMsg(message) {
    const msg = message.data;
    var messageElement = document.createElement("p");
    var text = document.createTextNode("Other: " + msg);
    messageElement.appendChild(text);
    messsageBoxDiv.appendChild(messageElement);
    console.log(message.data);
}