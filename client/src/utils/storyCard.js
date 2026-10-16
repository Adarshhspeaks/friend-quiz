// Generates a high-res, viral Story Card image (1080x1350) for Instagram, WhatsApp & Snapchat

export async function downloadStoryCard({ ownerName, playerName, score, total, verdict, link }) {
  const width = 1080;
  const height = 1350;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#E4F0FE');
  bgGrad.addColorStop(0.5, '#D5E8FD');
  bgGrad.addColorStop(1, '#C7E0FC');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative circles & doodles
  ctx.fillStyle = 'rgba(255, 230, 109, 0.4)';
  ctx.beginPath();
  ctx.arc(120, 180, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 101, 132, 0.35)';
  ctx.beginPath();
  ctx.arc(960, 240, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(78, 204, 163, 0.4)';
  ctx.beginPath();
  ctx.arc(920, 1180, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(196, 181, 253, 0.4)';
  ctx.beginPath();
  ctx.arc(140, 1140, 85, 0, Math.PI * 2);
  ctx.fill();

  // Helper for drawing rounded rect
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // 2. Top Header Pill
  ctx.fillStyle = '#FFE66D';
  ctx.strokeStyle = '#18192B';
  ctx.lineWidth = 6;
  roundRect(width / 2 - 280, 80, 560, 70, 35);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#18192B';
  ctx.font = '800 28px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ THE VIRAL FRIENDSHIP TEST ✨', width / 2, 124);

  // 3. Main Center Note-Card
  const cardX = 100;
  const cardY = 200;
  const cardW = width - 200;
  const cardH = 920;

  // Shadow
  ctx.fillStyle = '#18192B';
  roundRect(cardX + 14, cardY + 14, cardW, cardH, 40);
  ctx.fill();

  // Card Body
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18192B';
  ctx.lineWidth = 8;
  roundRect(cardX, cardY, cardW, cardH, 40);
  ctx.fill();
  ctx.stroke();

  // Washi Tape on card top
  ctx.fillStyle = 'rgba(255, 230, 109, 0.95)';
  ctx.strokeStyle = 'rgba(24, 25, 43, 0.5)';
  ctx.lineWidth = 3;
  ctx.save();
  ctx.translate(width / 2, cardY);
  ctx.rotate(-0.02);
  roundRect(-90, -18, 180, 36, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Subtitle inside card
  ctx.fillStyle = '#666';
  ctx.font = '700 32px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`How well does ${playerName} know ${ownerName}?`, width / 2, cardY + 95);

  // Giant Emoji
  ctx.font = '150px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
  ctx.fillText(verdict.emoji, width / 2, cardY + 270);

  // Verdict Title
  ctx.fillStyle = '#18192B';
  ctx.font = '800 60px "Shantell Sans", "Plus Jakarta Sans", cursive, sans-serif';
  ctx.fillText(verdict.text, width / 2, cardY + 375);

  // Score Pill
  const pillW = 460;
  const pillH = 95;
  const pillY = cardY + 430;
  ctx.fillStyle = '#FFE66D';
  ctx.strokeStyle = '#18192B';
  ctx.lineWidth = 6;
  roundRect(width / 2 - pillW / 2, pillY, pillW, pillH, 48);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#18192B';
  ctx.font = '800 44px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`${score} / ${total} (${verdict.pct}%)`, width / 2, pillY + 62);

  // Status Badge Pill
  const statusColor = verdict.color === 'mint' ? '#4ECCA3' : verdict.color === 'pink' ? '#FF6584' : '#FFE66D';
  const statusText = verdict.status;
  ctx.fillStyle = statusColor;
  ctx.strokeStyle = '#18192B';
  ctx.lineWidth = 5;
  roundRect(width / 2 - 220, cardY + 560, 440, 65, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = verdict.color === 'pink' ? '#FFFFFF' : '#18192B';
  ctx.font = '800 30px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(statusText, width / 2, cardY + 604);

  // Description quote box
  ctx.fillStyle = '#F8FAFD';
  ctx.strokeStyle = '#18192B';
  ctx.lineWidth = 4;
  roundRect(cardX + 50, cardY + 665, cardW - 100, 140, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#333333';
  ctx.font = '600 28px "Plus Jakarta Sans", system-ui, sans-serif';
  // Simple wrap for desc
  const words = verdict.desc.split(' ');
  let line = '';
  let lineY = cardY + 725;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > cardW - 140 && n > 0) {
      ctx.fillText(line, width / 2, lineY);
      line = words[n] + ' ';
      lineY += 40;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, lineY);

  // 4. Footer CTA & Link
  ctx.fillStyle = '#18192B';
  ctx.font = '800 34px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Can you beat ${playerName}'s score? Take the quiz! ➔`, width / 2, cardY + cardH + 75);

  ctx.fillStyle = '#555577';
  ctx.font = '700 26px "Plus Jakarta Sans", monospace, sans-serif';
  ctx.fillText(link.replace(/^https?:\/\//, ''), width / 2, cardY + cardH + 120);

  // 5. Convert to Blob & Share / Download
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const fileName = `quiz-score-${playerName.toLowerCase().replace(/\s+/g, '-')}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    // Try native share API on mobile devices
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${playerName}'s Quiz Score`,
          text: `I scored ${score}/${total} on ${ownerName}'s quiz! Can you beat my score?`,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: direct download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}
