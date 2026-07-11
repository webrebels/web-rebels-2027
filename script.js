// hide/show mobile menu
function toggleMenu() {
  document.getElementById("site-nav").classList.toggle("open");
}
document.getElementById("menu-toggle").addEventListener("click", toggleMenu);

// hide newsletter component
// function hideNewsletter() {
//  document.getElementById("newsletter").classList.add('closed');
// }
// document.getElementById("close-newsletter").addEventListener("click", hideNewsletter);

// switch between light/dark theme
var lightTheme;

if (typeof localStorage.lightTheme !== "undefined") {
  lightTheme = JSON.parse(localStorage.lightTheme);
} else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
  lightTheme = true;
} else {
  lightTheme = false;
}

function displayTheme() {
  if (lightTheme) {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
}

function changeTheme() {
  lightTheme = !lightTheme;
  localStorage.lightTheme = lightTheme;
  displayTheme();
}

document.getElementById("moon").addEventListener("click", changeTheme);

displayTheme();

// newsletter signup status (double opt-in flow, see netlify/functions)
var signupStatus = new URLSearchParams(window.location.search).get("signup");
var signupMessages = {
  pending: "Check your inbox! We just sent you an email. Click the link and you're on the list.",
  confirmed: "That's it, you're on the list. See you in your inbox!",
  invalid: "That link didn't work (they expire after 48 hours). Sign up below and we'll send you a fresh one.",
  error: "Something broke on our end. Give it another try in a few minutes.",
};

if (signupMessages[signupStatus]) {
  var newsletter = document.getElementById("newsletter");
  var status = document.createElement("p");
  status.className = "signup-status";
  status.textContent = signupMessages[signupStatus];
  newsletter.insertBefore(status, newsletter.querySelector("form"));
  if (signupStatus === "pending" || signupStatus === "confirmed") {
    newsletter.querySelector("form").style.display = "none";
  }
}
