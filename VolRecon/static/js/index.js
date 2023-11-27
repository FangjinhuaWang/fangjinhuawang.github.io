

// This is based on https://robustnerf.github.io/, : http://thenewcode.com/364/Interactive-Before-and-After-Video-Comparison-in-HTML5-Canvas
// With additional modifications based on: https://jsfiddle.net/7sk5k4gp/13/


var scans = [24, 63, 65, 69];


scan_selection_template = `
<li class="tablinks is-active" onclick="toggleView(event)" scan="scanid">
              <a>
                <span class="icon is-small"><i class="fas fa-image" aria-hidden="true"></i></span>
                <span>Scan scanid</span>
              </a>
            </li>
`;

scan_content_template = `
        <!--/ Scan 24 -->
        <div class="tabcontent" style="display: block;" scan="scanid">
          <!-- source views. -->
          <h4 class="title is-4">Source views</h2>
          <div class="columns is-centered has-text-centered">
            <div class="column">
              <img src="static/images/source_views/scanid/1.png" />
            </div>
            <div class="column">
              <img src="static/images/source_views/scanid/2.png" />
            </div>
            <div class="column">
              <img src="static/images/source_views/scanid/3.png" />
            </div>
          </div>
          <!-- source views. -->
          <!--/ Renderings -->
          <h4 class="title is-4">Model renderings</h2>
          <table>
            <tbody>
              <tr>
                <td align="left" valign="top" width="50%">
                  <video class="video" preload="auto" id="scanid" loop="" playsinline="" autoplay="" muted=""
                    src="static/videos/scanid.mp4" onplay="resizeAndPlay(this)" style="height: 0px;"></video>

                  <canvas class="videoMerge" id="scanidMerge"></canvas>
                </td>
              </tr>
            </tbody>
          </table>
          <!--/ Renderings -->
          <!-- 3D model. -->
          <div class="columns is-centered has-text-centered">
            <div class="column is-full_width">
              <h2 class="title is-4">Reconstructed 3D model</h2>
              <model-viewer alt="Scan scaind Mesh"
                exposure=".35 " shadow-intensity="1" shadow-softness="1"
                orientation = "orientation-string"
                src="https://raw.githubusercontent.com/khalilacheche/VolReconIBRN/main/meshes/scanid_c.glb"
                style="width: 100%; height: 600px; background-color: #404040"
                poster="https://github.com/IVRL/VolRecon/raw/main/imgs/teaser.jpg" auto-rotate camera-controls
                ar-status="not-presenting"></model-viewer>
            </div>
          </div>
          <!--/ 3D model. -->
        </div>
        <!--/ Scan 24 -->
`;



function loadScanSelection() {
  var ul = document.getElementById("scan_selection");
  var ul_html = "";
  for (let i = 0; i < scans.length; i++) {
    const scan = scans[i];
    element_html = scan_selection_template.replaceAll("scanid", scan);
    if (i != 0) {
      element_html = element_html.replaceAll("is-active", "");
    }
    ul_html += element_html;
  }
  ul.innerHTML = ul_html;
}
function loadScanContent() {
  var div = document.getElementById("scan_content");
  var div_html = "";
  for (let i = 0; i < scans.length; i++) {
    const scan = scans[i];
    element_html = scan_content_template.replaceAll("scanid", scan);
    element_html = element_html.replaceAll("orientation-string", transforms[scan]);
    if (i != 0) {
      element_html = element_html.replaceAll("style=\"display: block;\"", "style=\"display: none;\"");
    }
    div_html += element_html;
  }
  div.innerHTML = div_html;
}
$(document).ready(function () {
  loadScanSelection();
  loadScanContent();
});


var transforms = {
  24: "0 0 230deg",
  63: "0deg 210deg 300deg",
  65: "0deg 200deg 270deg",
  69: "0deg 210deg 290deg",
};


function transformModels() {
  modelViewerTransform.orientation = `${roll.value}deg ${pitch.value}deg ${yaw.value}deg`;
  modelViewerTransform.updateFraming();

}



function toggleView(evt) {
  var elem = evt.currentTarget;
  var scan = elem.attributes["scan"].value;

  // Get all elements with class="tabcontent" and hide them
  var tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    var display = tabcontent[i].attributes["scan"].value == scan ? "block" : "none";
    tabcontent[i].style.display = display;
  }

  // Get all elements with class="tablinks" and remove the class "active"
  var tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-active", "");
  }
  // Show the current tab, and add an "active" class to the button that opened the tab
  elem.className += " is-active";
}

function playVids(videoId) {
  var videoMerge = document.getElementById(videoId + "Merge");
  var vid = document.getElementById(videoId);

  var position = 0.5;
  var positionY = 0.5;
  var vidWidth = vid.videoWidth / 2;
  var vidHeight = vid.videoHeight;

  var mergeContext = videoMerge.getContext("2d");


  if (vid.readyState > 3) {
    vid.play();

    function trackLocation(e) {
      // Normalize to [0, 1]
      bcr = videoMerge.getBoundingClientRect();
      position = ((e.pageX - bcr.x) / bcr.width);
      positionY = ((e.pageY - (bcr.top + window.scrollY)) / bcr.height);
    }
    function trackLocationTouch(e) {
      // Normalize to [0, 1]
      bcr = videoMerge.getBoundingClientRect();
      position = ((e.touches[0].pageX - bcr.x) / bcr.width);
      positionY = ((e.touches[0].pageY - (bcr.top + window.scrollY)) / bcr.height);
    }

    videoMerge.addEventListener("mousemove", trackLocation, false);
    videoMerge.addEventListener("touchstart", trackLocationTouch, false);
    videoMerge.addEventListener("touchmove", trackLocationTouch, false);


    function drawLoop() {
      mergeContext.drawImage(vid, 0, 0, vidWidth, vidHeight, 0, 0, vidWidth, vidHeight);
      var colStart = (vidWidth * position).clamp(0.0, vidWidth);
      var colWidth = (vidWidth - (vidWidth * position)).clamp(0.0, vidWidth);
      mergeContext.drawImage(vid, colStart + vidWidth, 0, colWidth, vidHeight, colStart, 0, colWidth, vidHeight);
      requestAnimationFrame(drawLoop);


      var arrowLength = 0.09 * vidHeight;
      var arrowheadWidth = 0.025 * vidHeight;
      var arrowheadLength = 0.04 * vidHeight;
      var arrowPosY = positionY * vidHeight;
      var arrowWidth = 0.007 * vidHeight;
      var currX = vidWidth * position;
      drawOverlay(mergeContext, vidWidth, vidHeight, position, positionY, arrowLength, arrowheadWidth, arrowheadLength, arrowPosY, arrowWidth, currX);
    }
    requestAnimationFrame(drawLoop);
  }
}

Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};


function resizeAndPlay(element) {
  var cv = document.getElementById(element.id + "Merge");
  cv.width = element.videoWidth / 2;
  cv.height = element.videoHeight;

  element.play();
  element.style.height = "0px";  // Hide video without stopping it

  playVids(element.id);
}






function playVidsDual(videoId, videoId2) {
  var videoMerge = document.getElementById(videoId + "Merge");
  var vid = document.getElementById(videoId);

  var videoMerge2 = document.getElementById(videoId2 + "Merge");
  var vid2 = document.getElementById(videoId2);

  var position = 0.5;
  var vidWidth = vid.videoWidth / 2;
  var vidHeight = vid.videoHeight;

  var mergeContext = videoMerge.getContext("2d");
  var mergeContext2 = videoMerge2.getContext("2d");


  if ((vid.readyState > 3) && (vid2.readyState > 3)) {
    vid.play();
    vid2.play();

    function trackLocation(e) {
      // Normalize to [0, 1]
      bcr = videoMerge.getBoundingClientRect();
      position = ((e.pageX - bcr.x) / bcr.width);
      positionY = ((e.pageY - (bcr.top + window.scrollY)) / bcr.height);

      if (position > 1) {
        position = position - 1;
      }
      // console.log("pos1: " + position)
    }
    function trackLocationTouch(e) {
      // Normalize to [0, 1]
      bcr = videoMerge.getBoundingClientRect();
      position = ((e.touches[0].pageX - bcr.x) / bcr.width);
      positionY = ((e.touches[0].pageY - (bcr.top + window.scrollY)) / bcr.height);

      if (position > 1) {
        position = position - 1;
      }
    }

    videoMerge.addEventListener("mousemove", trackLocation, false);
    videoMerge.addEventListener("touchstart", trackLocationTouch, false);
    videoMerge.addEventListener("touchmove", trackLocationTouch, false);

    videoMerge2.addEventListener("mousemove", trackLocation, false);
    videoMerge2.addEventListener("touchstart", trackLocationTouch, false);
    videoMerge2.addEventListener("touchmove", trackLocationTouch, false);


    function drawLoop() {
      mergeContext.drawImage(vid, 0, 0, vidWidth, vidHeight, 0, 0, vidWidth, vidHeight);
      mergeContext2.drawImage(vid2, 0, 0, vidWidth, vidHeight, 0, 0, vidWidth, vidHeight);
      var colStart = (vidWidth * position).clamp(0.0, vidWidth);
      var colWidth = (vidWidth - (vidWidth * position)).clamp(0.0, vidWidth);
      mergeContext.drawImage(vid, colStart + vidWidth, 0, colWidth, vidHeight, colStart, 0, colWidth, vidHeight);
      mergeContext2.drawImage(vid2, colStart + vidWidth, 0, colWidth, vidHeight, colStart, 0, colWidth, vidHeight);
      requestAnimationFrame(drawLoop);

      drawOverlay(mergeContext, vidWidth, vidHeight, position, positionY);
      drawOverlay(mergeContext2, vidWidth, vidHeight, position, positionY);

    }
    requestAnimationFrame(drawLoop);
  }
}

Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};


function resizeAndPlayDual(element, id2) {
  var cv = document.getElementById(element.id + "Merge");
  cv.width = element.videoWidth / 2;
  cv.height = element.videoHeight;

  console.log("video height:" + element.videoHeight);
  console.log("video width:" + element.videoWidth);

  element.play();
  element.style.height = "0px";  // Hide video without stopping it

  element2 = document.getElementById(id2);
  var cv2 = document.getElementById(element2.id + "Merge");
  cv2.width = element2.videoWidth / 2;
  cv2.height = element2.videoHeight;

  console.log("video height:" + element2.videoHeight);
  console.log("video width:" + element2.videoWidth);

  element2.play();
  element2.style.height = "0px";  // Hide video without stopping it

  playVidsDual(element.id, element2.id);
}


function resizeAndPlayDualWhenReady(element, id2) {
  var element2 = document.getElementById(id2);
  var cnt = 0;
  setTimeout(function playIfReady() {
    if ((element2.readyState != 4) || (element.readyState != 4)) {
      console.log("second video is not ready yet, cnt=" + cnt);
      cnt++;
      // Bail out if it retries for more than 10 seconds.
      if (cnt < 1000) {
        setTimeout(playIfReady, 10);
      }
    }
    resizeAndPlayDual(element, id2);
  }, 10);
}



function drawOverlay(mergeContext, vidWidth, vidHeight, position, positionY, arrowLength, arrowheadWidth, arrowheadLength, arrowPosY, arrowWidth, currX) {
  // Draw circle
  mergeContext.arc(currX, arrowPosY, arrowLength * 0.7, 0, Math.PI * 2, false);
  mergeContext.fillStyle = "#FFD79340";
  mergeContext.fill();
  //mergeContext.strokeStyle = "#444444";
  //mergeContext.stroke()

  // Draw border
  mergeContext.beginPath();
  mergeContext.moveTo(vidWidth * position, 0);
  mergeContext.lineTo(vidWidth * position, vidHeight);
  mergeContext.closePath();
  mergeContext.strokeStyle = "#444444";
  mergeContext.lineWidth = 5;
  mergeContext.stroke();

  // Draw arrow
  mergeContext.beginPath();
  mergeContext.moveTo(currX, arrowPosY - arrowWidth / 2);

  // Move right until meeting arrow head
  mergeContext.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY - arrowWidth / 2);

  // Draw right arrow head
  mergeContext.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY - arrowheadWidth / 2);
  mergeContext.lineTo(currX + arrowLength / 2, arrowPosY);
  mergeContext.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY + arrowheadWidth / 2);
  mergeContext.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY + arrowWidth / 2);

  // Go back to the left until meeting left arrow head
  mergeContext.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY + arrowWidth / 2);

  // Draw left arrow head
  mergeContext.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY + arrowheadWidth / 2);
  mergeContext.lineTo(currX - arrowLength / 2, arrowPosY);
  mergeContext.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY - arrowheadWidth / 2);
  mergeContext.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY);

  mergeContext.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY - arrowWidth / 2);
  mergeContext.lineTo(currX, arrowPosY - arrowWidth / 2);

  mergeContext.closePath();

  mergeContext.fillStyle = "#444444";
  mergeContext.fill();
}