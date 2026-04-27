(function () {
  var match = location.pathname.match(/^\/(fr|nl|en)\//);
  if (match) {
    document.cookie = 'lang=' + match[1] + ';path=/;max-age=31536000;SameSite=Lax';
  }
})();
