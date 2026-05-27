export function playSigh() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const t   = ctx.currentTime
    const dur = 1.9

    // Atemrauschen — gefiltertes weißes Rauschen
    const bufLen = ctx.sampleRate * dur
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data   = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1

    const noise = ctx.createBufferSource()
    noise.buffer = buf

    const bpf = ctx.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.setValueAtTime(2200, t)
    bpf.frequency.exponentialRampToValueAtTime(600, t + dur)
    bpf.Q.value = 0.6

    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0, t)
    ng.gain.linearRampToValueAtTime(0.18, t + 0.12)
    ng.gain.setValueAtTime(0.18, t + 0.5)
    ng.gain.linearRampToValueAtTime(0, t + dur)

    noise.connect(bpf); bpf.connect(ng); ng.connect(ctx.destination)
    noise.start(t); noise.stop(t + dur)

    // Vokal-Komponente — absinkender Sinus für das "Ugh"
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(240, t + 0.08)
    osc.frequency.linearRampToValueAtTime(190, t + 0.4)
    osc.frequency.linearRampToValueAtTime(130, t + dur * 0.8)

    const og = ctx.createGain()
    og.gain.setValueAtTime(0, t)
    og.gain.linearRampToValueAtTime(0.09, t + 0.18)
    og.gain.setValueAtTime(0.09, t + 0.45)
    og.gain.linearRampToValueAtTime(0, t + dur * 0.8)

    osc.connect(og); og.connect(ctx.destination)
    osc.start(t + 0.08); osc.stop(t + dur)
  } catch (_) { /* kein Audio-Support — schweigend ignorieren */ }
}
