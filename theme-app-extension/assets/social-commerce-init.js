var CRL8_SITENAME = "";
var scContainer = document.querySelector(".claymind-crl8");
if (scContainer) {
    CRL8_SITENAME = scContainer.dataset.siteName;
}
console.log('CRL8_SITENAME: ' + CRL8_SITENAME);
!function(){var e=window.crl8=window.crl8||{},n=!1,i=[];e.ready=function(e){n?e():i.push(e)},e.pixel=e.pixel||function(){e.pixel.q.push(arguments)},e.pixel.q=e.pixel.q||[];var t=window.document,o=t.createElement("script"),c=e.debug||-1!==t.location.search.indexOf("crl8-debug=true")?"js":"min.js";o.async=!0,o.src=t.location.protocol+"//edge.curalate.com/sites/"+CRL8_SITENAME+"/site/latest/site."+c,o.onload=function(){n=!0,i.forEach(function(e){e()})};var r=t.getElementsByTagName("script")[0];r.parentNode.insertBefore(o,r.nextSibling)}();
