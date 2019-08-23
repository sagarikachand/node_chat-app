//this is the conneciton information
const socket = io();

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Elements
const chatForm = document.querySelector("#message-form");
const formButton = document.querySelector('button');
const locationBtn = document.querySelector("#send-location");
const messages = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll =() =>{
  const newMessage= messages.lastElementChild
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight =  newMessage.offsetHeight +newMessageMargin
 
  //visible height
  const visibleHeight = messages.offsetHeight;
  // Actual height of container
  const containerHeight = messages.scrollHeight;
  //How far have I scrollled 
  const scrollOffset =messages.scrollTop + visibleHeight
  // if before adding the new message were we at the bottom
  if(containerHeight - newMessageHeight <= scrollOffset){
   messages.scrollTop = messages.scrollHeight;
  }

}
socket.on('message', (msg) => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('locationMessage', (msg) => {
  const html = Mustache.render(locationTemplate, {
    username: msg.username,
    link: msg.link,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  messages.insertAdjacentHTML('beforeend', html)

})

socket.on('roomData', (roomData) => {
  const html = Mustache.render(sidebarTemplate, {
    room: roomData.room,
    users: roomData.users
  })
  sidebar.innerHTML =html
  console.log(roomData)
})


chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formButton.setAttribute('disabled', 'disabled')
  //   const msg= (document.querySelector("#chatMsg")).value;
  const input = e.target.elements.message
  const msg = input.value

  socket.emit("sendMessage", msg, (error) => {
    formButton.removeAttribute('disabled')
    input.value = ''
    input.focus()
    if (error) {
      return console.log(error)
    }
    console.log('Message delivered')
  })
})


locationBtn.addEventListener('click', (e) => {
  e.preventDefault();

  if (!window.navigator.geolocation) {
    return alert('geolocation is not supported by your browser')
  }

  locationBtn.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      long: position.coords.longitude
    }, () => {
      locationBtn.removeAttribute('disabled')
      console.log("location Shared")
    })
  })
})


socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }

})

