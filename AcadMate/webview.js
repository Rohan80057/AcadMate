window.loadWebview = function(container) {
  container.innerHTML = `
    <div class="webview-chooser-box fade-in">
      <h2>Select Platform</h2>
      <div style="display:flex; gap:24px; margin:32px 0;">
        <button class="webview-site-btn" data-url="https://newerp.kluniversity.in/">Open ERP</button>
        <button class="webview-site-btn" data-url="https://bmp-lms.klh.edu.in/">Open LMS</button>
      </div>
    </div>
    <div id="webview-wrap" style="display:none; height: 72vh;">
      <iframe id="webview-iframe" src="" frameborder="0"
        style="width:100%; height:100%; border-radius:18px; background:#fff; box-shadow:0 6px 32px #0001;"
        allowfullscreen></iframe>
    </div>
  `;

  const chooser = container.querySelector('.webview-chooser-box');
  const webviewWrap = container.querySelector('#webview-wrap');
  const iframe = container.querySelector('#webview-iframe');

  container.querySelectorAll('.webview-site-btn').forEach(btn => {
    btn.onclick = function() {
      iframe.src = btn.dataset.url;
      chooser.style.display = 'none';
      webviewWrap.style.display = '';
    };
  });
};
