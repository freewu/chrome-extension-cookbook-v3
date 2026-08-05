let div = document.createElement("div");
div.style.zIndex = "9999";
div.style.position = "fixed";
div.style.top = "0";
div.style.left = "0";
div.style.padding = "5px";
div.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
div.innerHTML = "user-script run!!!<br>";
document.body.appendChild(div);

alert("user-script run run run!!!");