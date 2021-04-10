function prank(e, button) {
    e.preventDefault();
    var x = innerWidth
    var y = innerHeight
    var randomHeight = Math.floor(Math.random() * x) - e.target.offsetWidth
    var randomWidth = Math.floor(Math.random() * y) - e.target.offsetHeight
    button.style.position = "absolute";
    button.style.left = `${randomHeight}px`;
    button.style.top = `${randomWidth}px`;
}

function prank2(e, button) {
    e.preventDefault();
    var x = innerWidth
    var y = innerHeight
    var randomHeight = Math.floor(Math.random() * x) - e.target.offsetWidth
    var randomWidth = Math.floor(Math.random() * y) - e.target.offsetHeight
    button.style.position = "absolute";
    button.style.left = `${randomHeight}px`;
    button.style.top = `${randomWidth}px`;
    button.blur();
}