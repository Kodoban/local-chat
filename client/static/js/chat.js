'use strict'

const messages = document.getElementById("messages");
var socketio = io();

socketio.on('message', function(data) {
    createMessage(data.name, data.content);
});

function createMessage(name, msg) {
    const content = 
    `
        <div class="text">
            <span>
                <strong>${name}: </strong>${msg}
            </span>
        </div>
    `

    messages.innerHTML += content;
}

function sendMessage() {
    let message = document.getElementById("message");
    if (message.value == "") return;
    socketio.emit('message', {data: message.value});
    message.value=""; 
}