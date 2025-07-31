export function loadHome(container) {
  container.innerHTML = `
    <section style="text-align: center; padding: 50px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 40px;">
        <img src="assets/hero.png" alt="Hero" style="width: 120px; height: auto; margin-bottom: 20px;">
        <h1 style="font-size: 2rem; color: #5f3dc4;">Welcome to <strong>AcadMate</strong></h1>
        <p style="font-size: 1.1rem; color: #555;">Get started by selecting a module from the sidebar.<br>Boost your productivity and organize your study life today!</p>
      </div>
    </section>
  `;
}
