if (window.location.protocol != "https:") {
  var subdomain = window.location.host.split('.')[0];
  if(window.location.host.split('.').length < 3 || subdomain === 'www') {
    window.location.href =
      "https:" + window.location.href.substring(window.location.protocol.length);
  }
}
