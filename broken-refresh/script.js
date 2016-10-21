var value = 1;

var html = document.getElementById('html');
var js = document.getElementById('js');

if (html.innerHTML == value) {
	js.innerHTML = value + " MATCH";
} else {
	js.innerHTML = value + " MISMATCH";
}