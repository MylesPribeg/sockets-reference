function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//generate random user ID
var id// = getRandomInt(50);
//var socket = io();
var socket = io({
    autoConnect:false,
    auth: {
        token: id
    }
})
var form = document.getElementById('form')
var input = document.getElementById('input')

var btns = []
var currentGroup = ''

var cnbtn = document.getElementById('connectbtn')
var idIn = document.getElementById('idInput')

var users = []

var messagesStore = new Map();

//end middlewares with next()

form.addEventListener('submit', function(e){
    e.preventDefault();
    if(input.value){
        console.log("message emitted")
        socket.emit('chat message', 
        {
            to: currentGroup,
            content: input.value,
            from: id
        }, (response) =>{
            console.log(response.status)
        });
        input.value = '';
        input.placeholder = 'Send message as ' + id;
    }
})

function btnHandler(){
    document.getElementById('messages').innerHTML = "";
    document.getElementById('rmTitle').innerText = this.innerText;
    currentGroup = this.innerText;
    input.disabled = false;

    //load messages into chat area (list)
    messagesStore.get(currentGroup).forEach(({from, content}) =>{
        var item = document.createElement('li');
        item.textContent = from + ": " + content;
        messages.appendChild(item)
    })
    window.scrollTo(0, document.body.scrollHeight)
}

cnbtn.addEventListener('click', function(){
    id = idIn.value
    idIn.disabled = true;
    cnbtn.disable = true;
    socket.auth.token = id
    socket.connect()
    input.placeholder = "Send message as user " + id +"...";
} )



// function stoppedTyping(){
//     socket.emit('stopped typing')
// }

//for typing indicator
// form.addEventListener("input", function(){
//     //t.preventDefault();
//     socket.emit('typing')
//     setTimeout(stoppedTyping, 3000)
// })

// socket.on('typing', function(){
//     var item = document.createElement('li');
//     item.id = -1
//     item.textContent = "A user is typing";
//     messages.appendChild(item)
// })

// socket.on('stopped typing', function(){
//     var item = document.createElement('li');
//     item.textContent = "A user stopped typing";
//     messages.appendChild(item)
// })

socket.on('chat message', function({to, content, from}){
    console.log("message incoming: " + content)
    var item = document.createElement('li');
    item.textContent = from + ": " + content;
    messages.appendChild(item)
    window.scrollTo(0, document.body.scrollHeight)

    //TODO
    // go through each chat, add to messages of that chat
    // if chat is not the current one open then set unread flag
    messagesStore.get(to).push({from, content})
    console.log(messagesStore.get(to))

})

function reloadUserList(users){
    document.getElementById("userlist").innerHTML = ""
    users.forEach((element) => {
        var item = document.createElement('li');
        item.textContent = element;
        userlist.appendChild(item)
    })
}

socket.on('userlist', (rUserlist) =>{
    users = rUserlist;
    console.log("userlist received: " + users)
    reloadUserList(users)
})

socket.on('grouplist', (grplist) =>{
    console.log("grouplist received: " + grplist)
    console.log(grplist)
    // create group buttons for this users available groups
    grplist.forEach((element) => {
        console.log("button for: " + element)
        var item = document.createElement('button');
        item.addEventListener('click', btnHandler)
        item.textContent = element
        roombtns.appendChild(item)
        btns.push(item)

        // create message array
        messagesStore.set(element, [])
    })
})

socket.on('user connected', (id) =>{
    users.push(id)
    console.log("user " + id + "added" )
    console.log(users)
    var item = document.createElement('li');
    item.textContent = id;
    userlist.appendChild(item)

})

socket.on('user disconnected', (id) =>{
    let index = users.indexOf(id)
    console.log("user " + id + " removed, index " + index)
    if (index > -1){
        users.splice(index, 1)
    }
    console.log(users)
   
    reloadUserList(users)
})