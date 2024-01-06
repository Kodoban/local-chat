'use strict'

const conversationBox = document.getElementById("conversationBox");
const messages = document.getElementById("messages");
const anchor = document.getElementById("anchor");
var socketio = io();

document.addEventListener("DOMContentLoaded", function(event) {
    let dates = document.getElementsByClassName("metadata-send-time");
    for (let sendTime of dates) {
        sendTime.innerHTML = (new Date(sendTime.innerText)).toLocaleString();
    }
});

socketio.on('message', function(data) {
    createMessage(data.name, data.content, new Date(data.send_time));
});

function createMessage(name, msg, sendTime) {

    let messageItem = Object.assign(document.createElement("div"), {
        className: "message-item"
    });

    let messageContainer = Object.assign(document.createElement("div"), {
        className: "message-container"
    });

    let messageSendTime = Object.assign(document.createElement("span"), {
        className: "metadata-send-time",
        innerHTML: sendTime.toLocaleString()
    });

    let messageContent = document.createElement("span");
    if (name === "") {
        messageItem.classList.toggle("own-message");
        messageSendTime.classList.toggle("own-message-text-align");
        messageContent.classList.toggle("own-message-text-align");
        messageContent.innerHTML = msg;
    } 
    else {
        messageContent.innerHTML = `<strong>${name}: </strong>${msg}`;
    }
    
    messageContainer.appendChild(messageSendTime);
    messageContainer.appendChild(messageContent);
    messageItem.appendChild(messageContainer);
    messages.insertBefore(messageItem, anchor);

    if (name != "" && !userViewingNewestMessage()) {
        addNewMessageRibbon();
        toggleNewMessageRibbon();
    }
}

function sendMessage() {
    let sendTime = new Date();
    let message = document.getElementById("message");
    if (message.value == "") return;
    createMessage("", message.value, sendTime);
    scrollToNewestMessage();
    socketio.emit('message', {content: message.value, send_time: sendTime});
    message.value="";
}

function scrollToNewestMessage() {
    messages.scrollTo({top: messages.scrollHeight, bottom: 0, behavior: "smooth"});
}

function userViewingNewestMessage() {
    //https://stackoverflow.com/a/876134
    return messages.scrollTop === (messages.scrollHeight - messages.offsetHeight);
}

function addNewMessageRibbon() {

    let newMessageRibbon = Object.assign(document.createElement("div"), {
        className: "alert alert-primary new-messages-alert",
        id: "newMessageRibbon",
        role: "alert"
    });

    let newMessageRibbonText = Object.assign(document.createElement("p"), {
        className: "new-message-alert-text",
        innerHTML: "There are new messages"
    });

    let newMessageRibbonButton = Object.assign(document.createElement("button"), {
        type: "button",
        id: "closeNewMessageButton",
        className: "btn btn-primary",
        innerHTML: "Go to latest message",
        onclick: goToLatestMessage
    });

    newMessageRibbon.appendChild(newMessageRibbonText);
    newMessageRibbon.appendChild(newMessageRibbonButton);
    // document.insertBefore(newMessageRibbon, messages);
    conversationBox.insertBefore(newMessageRibbon, messages);
}

function removeNewMessageRibbon() {
    document.getElementById("newMessageRibbon").remove();
}

function toggleNewMessageRibbon() {
    document.getElementById("newMessageRibbon").classList.toggle("active");
}

function goToLatestMessage() {
    scrollToNewestMessage();
    toggleNewMessageRibbon();
    removeNewMessageRibbon();
}