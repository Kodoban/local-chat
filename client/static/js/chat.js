'use strict'

const conversationBox = document.getElementById("conversationBox");
const messages = document.getElementById("messages");
const anchor = document.getElementById("anchor");
var socketio = io();

// TODO: Hide messages/times until the timestamps are replaced?
document.addEventListener("DOMContentLoaded", function(event) {
    let dates = document.getElementsByClassName("metadata-send-time");
    for (let sendTime of dates) {
        // TODO: Find out why this works for converting send time to locale time (and why the old version printed everything in UTC)
        sendTime.innerHTML = (new Date(Date(sendTime.innerText))).toLocaleString();
    }
});

socketio.on('message', function(message) {
    createMessage(message.name, message.content, new Date(message.send_time));
});

socketio.on('notification', function(messagePreview) {
    // TODO: Does not work if a new chat is started by another user while the logged in user is in the chat page
    let chatPreview = document.querySelector(`.list-group-item#id${messagePreview.chat_id} .latest-message`);
    chatPreview.innerHTML = `${messagePreview.name}: ${messagePreview.content}`;
});

function createMessage(name, msg, sendTime) {

    let messageItem = Object.assign(document.createElement("div"), {
        className: "message-item"
    });

    let profilePictureContainer = Object.assign(document.createElement("div"), {
        className: "profile-picture-container"
    });

    let profilePicture = Object.assign(document.createElement("img"), {
        className: "profile-picture",
        alt: "Profile Picture"
    });
    
    if (name==="") {
        profilePicture.classList.toggle("own");
        let image = document.querySelector(".own").src;
        profilePicture.src = image;
    }
    else {
        profilePicture.classList.toggle("other");
        let image = document.querySelector(".other").src; //Has to be more distinctive for group chat, e.g. "{id} profile-picture", TODO
        profilePicture.src = image;
    }

    profilePictureContainer.appendChild(profilePicture);


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
        // TODO: Add name to different place in message (e.g. on top)
        messageContent.innerHTML = `<strong>${name}: </strong>${msg}`; 
    }
    
    messageContainer.appendChild(messageSendTime);
    messageContainer.appendChild(messageContent);

    if (name === "") {
        messageItem.appendChild(messageContainer);
        messageItem.appendChild(profilePictureContainer);
    } 
    else {
        messageItem.appendChild(profilePictureContainer);
        messageItem.appendChild(messageContainer);
    }
    
    messages.insertBefore(messageItem, anchor);

    if (name != "" && !userViewingNewestMessage()) {
        addNewMessageRibbon();
        toggleNewMessageRibbon();
    }

    // Show new message in chat preview in the sidebar
    // TODO: Would this work if a user was had 2 or more tabs of the chat page active but was on different chats?
    let chatPreview = document.querySelector(`.list-group-item#id${new URL(location.href).pathname.split('/').pop()} .latest-message`);
    if (name === "") {
        chatPreview.innerHTML = `<i>You:</i> ${msg}`;
    }
    else {
        chatPreview.innerHTML = `${name}: ${msg}`;
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