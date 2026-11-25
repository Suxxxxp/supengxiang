/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：首页 canvas 背景动画（漂浮粒子 + 粒子连线 + 鼠标跟随）
 */
(function () {
  'use strict';

  const spx_canvas = document.getElementById('spx_canvasBg');
  if (!spx_canvas) return;

  const spx_ctx = spx_canvas.getContext('2d');
  const spx_reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spx_colors = ['94, 234, 212', '96, 165, 250', '167, 139, 250'];
  const spx_linkDistance = 128;
  const spx_mouseDistance = 160;
  const spx_mouse = { spx_x: -9999, spx_y: -9999 };

  let spx_width = 0;
  let spx_height = 0;
  let spx_particles = [];

  // 根据窗口尺寸与设备像素比初始化画布，并重新生成粒子
  function spx_resize() {
    const spx_dpr = Math.min(window.devicePixelRatio || 1, 2);
    spx_width = window.innerWidth;
    spx_height = window.innerHeight;
    spx_canvas.width = Math.floor(spx_width * spx_dpr);
    spx_canvas.height = Math.floor(spx_height * spx_dpr);
    spx_ctx.setTransform(spx_dpr, 0, 0, spx_dpr, 0, 0);
    spx_createParticles();
  }

  // 按窗口面积生成一定数量的粒子
  function spx_createParticles() {
    const spx_count = Math.min(110, Math.max(36, Math.round((spx_width * spx_height) / 17000)));
    spx_particles = [];
    for (let spx_i = 0; spx_i < spx_count; spx_i++) {
      spx_particles.push({
        spx_x: Math.random() * spx_width,
        spx_y: Math.random() * spx_height,
        spx_vx: (Math.random() - 0.5) * 0.36,
        spx_vy: (Math.random() - 0.5) * 0.36,
        spx_radius: Math.random() * 1.6 + 0.8,
        spx_color: spx_colors[Math.floor(Math.random() * spx_colors.length)]
      });
    }
  }

  // 更新单个粒子位置：缓慢漂浮、越界回绕、靠近鼠标时轻微排斥
  function spx_updateParticle(spx_particle) {
    spx_particle.spx_x += spx_particle.spx_vx;
    spx_particle.spx_y += spx_particle.spx_vy;

    if (spx_particle.spx_x < -20) spx_particle.spx_x = spx_width + 20;
    if (spx_particle.spx_x > spx_width + 20) spx_particle.spx_x = -20;
    if (spx_particle.spx_y < -20) spx_particle.spx_y = spx_height + 20;
    if (spx_particle.spx_y > spx_height + 20) spx_particle.spx_y = -20;

    const spx_dx = spx_particle.spx_x - spx_mouse.spx_x;
    const spx_dy = spx_particle.spx_y - spx_mouse.spx_y;
    const spx_distance = Math.sqrt(spx_dx * spx_dx + spx_dy * spx_dy);
    if (spx_distance < 110 && spx_distance > 0.01) {
      const spx_power = (110 - spx_distance) / 110;
      spx_particle.spx_x += (spx_dx / spx_distance) * spx_power * 0.9;
      spx_particle.spx_y += (spx_dy / spx_distance) * spx_power * 0.9;
    }
  }

  // 绘制一帧：粒子之间的连线、粒子本体、粒子与鼠标的连线
  function spx_draw() {
    spx_ctx.clearRect(0, 0, spx_width, spx_height);

    spx_particles.forEach(spx_updateParticle);

    for (let spx_i = 0; spx_i < spx_particles.length; spx_i++) {
      const spx_a = spx_particles[spx_i];
      for (let spx_j = spx_i + 1; spx_j < spx_particles.length; spx_j++) {
        const spx_b = spx_particles[spx_j];
        const spx_dx = spx_a.spx_x - spx_b.spx_x;
        const spx_dy = spx_a.spx_y - spx_b.spx_y;
        const spx_distance = Math.sqrt(spx_dx * spx_dx + spx_dy * spx_dy);
        if (spx_distance > spx_linkDistance) continue;

        spx_ctx.strokeStyle = 'rgba(96, 165, 250, ' + (0.18 * (1 - spx_distance / spx_linkDistance)).toFixed(3) + ')';
        spx_ctx.lineWidth = 1;
        spx_ctx.beginPath();
        spx_ctx.moveTo(spx_a.spx_x, spx_a.spx_y);
        spx_ctx.lineTo(spx_b.spx_x, spx_b.spx_y);
        spx_ctx.stroke();
      }
    }

    spx_particles.forEach(function (spx_particle) {
      const spx_dx = spx_particle.spx_x - spx_mouse.spx_x;
      const spx_dy = spx_particle.spx_y - spx_mouse.spx_y;
      const spx_distance = Math.sqrt(spx_dx * spx_dx + spx_dy * spx_dy);

      // 鼠标附近粒子与光标相连，突出交互感
      if (spx_distance < spx_mouseDistance) {
        spx_ctx.strokeStyle = 'rgba(94, 234, 212, ' + (0.3 * (1 - spx_distance / spx_mouseDistance)).toFixed(3) + ')';
        spx_ctx.lineWidth = 1;
        spx_ctx.beginPath();
        spx_ctx.moveTo(spx_particle.spx_x, spx_particle.spx_y);
        spx_ctx.lineTo(spx_mouse.spx_x, spx_mouse.spx_y);
        spx_ctx.stroke();
      }

      spx_ctx.beginPath();
      spx_ctx.fillStyle = 'rgba(' + spx_particle.spx_color + ', 0.78)';
      spx_ctx.arc(spx_particle.spx_x, spx_particle.spx_y, spx_particle.spx_radius, 0, Math.PI * 2);
      spx_ctx.fill();
    });
  }

  // 动画主循环
  function spx_loop() {
    spx_draw();
    window.requestAnimationFrame(spx_loop);
  }

  // 记录鼠标位置，供粒子避让与连线使用
  function spx_handleMouseMove(spx_event) {
    spx_mouse.spx_x = spx_event.clientX;
    spx_mouse.spx_y = spx_event.clientY;
  }

  // 鼠标移出窗口时清空位置，避免连线残留
  function spx_handleMouseLeave() {
    spx_mouse.spx_x = -9999;
    spx_mouse.spx_y = -9999;
  }

  window.addEventListener('resize', spx_resize);
  window.addEventListener('mousemove', spx_handleMouseMove);
  window.addEventListener('mouseleave', spx_handleMouseLeave);

  spx_resize();
  // 用户偏好减少动效时只静态绘制一帧
  if (spx_reduceMotion) {
    spx_draw();
  } else {
    spx_loop();
  }
})();
