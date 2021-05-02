// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

//Get the speeck volume
var speechVolume = document.getElementById('volume-group').querySelector('input');

// Load canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext("2d");

// All the buttons
const buttons = document.querySelectorAll('button');

// Get all popular voice
function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }
  document.querySelector('select').disabled = false;
  var voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    document.getElementById('voice-selection').removeChild(document.getElementById('voice-selection').getElementsByTagName('option')[0]);
  }

  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    document.getElementById("voice-selection").appendChild(option);
  }
}
populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Draw the image to the canvas
function draw_IMG(){
  const Dimmensions = getDimmensions(canvas.width,canvas.height,img.width,img.height);
  console.log(Dimmensions);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img,Dimmensions.startX,Dimmensions.startY, Dimmensions.width,Dimmensions.height);
}

// Draw TEXT on to the canvas
function draw_TEXT(){
  let textTop = document.getElementById('text-top').value;
  let textBot = document.getElementById('text-bottom').value;
  ctx.font = '38px fantasy';
  ctx.fillStyle = "red";
  // Put the text in the middle of the canvas
  var metrics = ctx.measureText(textTop);
  var textWidth = metrics.width;
  var xPosition = (canvas.width/2) - (textWidth/2);
  ctx.fillText(textTop,xPosition, 38, canvas.width);

  metrics = ctx.measureText(textBot);
  textWidth = metrics.width;
  xPosition = (canvas.width/2) - (textWidth/2);
  ctx.fillText(textBot,xPosition, canvas.height-10, canvas.width);
}

// Fires wheever we choose the file to upload
document.getElementById('image-input').addEventListener('change', (e) => { 
  const file = e.target.files[0];
  img.src = URL.createObjectURL(file);
  console.log(img.src);
  var imagename = e.target.value.substring(e.target.value.lastIndexOf("\\")+1);
  img.alt = imagename;
  console.log(img.alt);
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  buttons.item(0).disabled = false;
  buttons.item(1).disabled = true;
  buttons.item(2).disabled = true;
  draw_IMG();

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// Fires whenever the user click the "Generate"
document.getElementById('generate-meme').addEventListener('submit', (e) => {
  console.log("You have click generate text");
  draw_TEXT();
  e.preventDefault();
  buttons.item(0).disabled = true;
  buttons.item(1).disabled = false;
  buttons.item(2).disabled = false;
});

// Clear the canvas when user click "Clear"
buttons.item(1).addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //document.getElementById('generate-meme').querySelector('input').value=null;
  buttons.item(0).disabled = false;
  buttons.item(1).disabled = true;
  buttons.item(2).disabled = true;
});

//Read the text using a language
buttons.item(2).addEventListener('click', () => {
  let toptext = document.getElementById('text-top').value 
  let bottext = document.getElementById('text-bottom').value;
  let text = toptext + bottext;
  let voicesIndex = document.querySelector('#voice-selection').selectedIndex;
  const voices = speechSynthesis.getVoices();
  let msg = new SpeechSynthesisUtterance(text);
  msg.volume = speechVolume.value/100;
  msg.voice = voices[voicesIndex];
  speechSynthesis.speak(msg);
});

// Change the volume
speechVolume.addEventListener('input', (e) => {
  let volumeValue = speechVolume.value;
  let volumeImg = document.getElementById('volume-group').querySelector('img');
  if(volumeValue == 0) {
    volumeImg.src = "icons/volume-level-0.svg"
    volumeImg.alt = "Volume Level 0"
  }
  else if(volumeValue >= 1 && volumeValue <= 33) {
    volumeImg.src = "icons/volume-level-1.svg"
    volumeImg.alt = "Volume Level 1"
  }
  else if(volumeValue >= 34 && volumeValue <= 66){
    volumeImg.src = "icons/volume-level-2.svg"
    volumeImg.alt = "Volume Level 2"
  }
  else {
    volumeImg.src = "icons/volume-level-3.svg"
    volumeImg.alt = "Volume Level 3"
  }
});


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
