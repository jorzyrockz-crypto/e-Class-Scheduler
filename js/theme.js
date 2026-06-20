function parseToHsl(colorStr) {
  let r = 0, g = 0, b = 0;
  if (!colorStr) return { h: 160, s: 100, l: 30 };
  
  colorStr = colorStr.trim().toLowerCase();
  
  if (colorStr.startsWith('#')) {
    let hex = colorStr.substring(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else if (colorStr.startsWith('rgb')) {
    const matches = colorStr.match(/\d+/g);
    if (matches && matches.length >= 3) {
      r = parseInt(matches[0]);
      g = parseInt(matches[1]);
      b = parseInt(matches[2]);
    }
  } else {
    return { h: 160, s: 100, l: 30 };
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function generateDynamicTheme(seedColor, isDark) {
  const { h, s } = parseToHsl(seedColor);
  
  const sPrimary = Math.max(45, Math.min(85, s));
  const sSecondary = Math.max(10, s * 0.3);
  const sNeutral = Math.min(10, s * 0.12);
  const sNeutralVar = Math.min(16, s * 0.2);

  const variables = {};

  if (isDark) {
    variables['--md-sys-color-primary'] = `hsl(${h}, ${sPrimary}%, 75%)`;
    variables['--md-sys-color-primary-hover'] = `hsl(${h}, ${sPrimary}%, 80%)`;
    variables['--md-sys-color-primary-container'] = `hsl(${h}, ${sPrimary}%, 20%)`;
    variables['--md-sys-color-on-primary-container'] = `hsl(${h}, ${sPrimary}%, 90%)`;
    
    variables['--md-sys-color-background'] = `hsl(${h}, ${sNeutral}%, 8%)`;
    variables['--md-sys-color-surface'] = `hsl(${h}, ${sNeutral}%, 12%)`;
    variables['--md-sys-color-on-background'] = `hsl(${h}, ${sNeutral}%, 90%)`;
    variables['--md-sys-color-on-surface'] = `hsl(${h}, ${sNeutral}%, 90%)`;
    
    variables['--md-sys-color-surface-variant'] = `hsl(${h}, ${sNeutralVar}%, 18%)`;
    variables['--md-sys-color-on-surface-variant'] = `hsl(${h}, ${sNeutralVar}%, 80%)`;
    variables['--md-sys-color-outline'] = `hsl(${h}, ${sNeutralVar}%, 45%)`;
    variables['--md-sys-color-outline-variant'] = `hsl(${h}, ${sNeutralVar}%, 26%)`;
  } else {
    variables['--md-sys-color-primary'] = `hsl(${h}, ${sPrimary}%, 40%)`;
    variables['--md-sys-color-primary-hover'] = `hsl(${h}, ${sPrimary}%, 32%)`;
    variables['--md-sys-color-primary-container'] = `hsl(${h}, ${sPrimary}%, 92%)`;
    variables['--md-sys-color-on-primary-container'] = `hsl(${h}, ${sPrimary}%, 15%)`;
    
    // Boosted saturation and slightly adjusted lightness for a more colorful light mode
    const sLightBg = Math.min(40, Math.max(15, s * 0.4));
    variables['--md-sys-color-background'] = `hsl(${h}, ${sLightBg}%, 95%)`;
    variables['--md-sys-color-surface'] = `hsl(${h}, ${sLightBg}%, 98%)`;
    variables['--md-sys-color-on-background'] = `hsl(${h}, ${sNeutral}%, 12%)`;
    variables['--md-sys-color-on-surface'] = `hsl(${h}, ${sNeutral}%, 12%)`;
    
    variables['--md-sys-color-surface-variant'] = `hsl(${h}, ${sNeutralVar}%, 92%)`;
    variables['--md-sys-color-on-surface-variant'] = `hsl(${h}, ${sNeutralVar}%, 30%)`;
    variables['--md-sys-color-outline'] = `hsl(${h}, ${sNeutralVar}%, 50%)`;
    variables['--md-sys-color-outline-variant'] = `hsl(${h}, ${sNeutralVar}%, 85%)`;
  }

  // Set translucents
  variables['--md-sys-color-primary-light'] = isDark ? `hsla(${h}, ${sPrimary}%, 75%, 0.12)` : `hsla(${h}, ${sPrimary}%, 40%, 0.06)`;
  variables['--md-sys-color-primary-glow'] = isDark ? `hsla(${h}, ${sPrimary}%, 75%, 0.25)` : `hsla(${h}, ${sPrimary}%, 40%, 0.15)`;

  // Generate success, warning, info, error semantics
  const errorVars = generateSemanticColor(4, 80, 'error', isDark);
  const successVars = generateSemanticColor(142, 65, 'success', isDark);
  const warningVars = generateSemanticColor(36, 80, 'warning', isDark);
  const infoVars = generateSemanticColor(215, 75, 'info', isDark);

  const allVars = {
    ...variables,
    ...errorVars,
    ...successVars,
    ...warningVars,
    ...infoVars
  };

  const root = document.documentElement;
  Object.keys(allVars).forEach(key => {
    root.style.setProperty(key, allVars[key]);
  });
}

function generateSemanticColor(h, s, prefix, isDark) {
  const vars = {};
  if (isDark) {
    vars[`--md-sys-color-${prefix}`] = `hsl(${h}, ${s}%, 70%)`;
    vars[`--md-sys-color-on-${prefix}`] = `hsl(${h}, ${s}%, 15%)`;
    vars[`--md-sys-color-${prefix}-container`] = `hsl(${h}, ${s}%, 16%)`;
    vars[`--md-sys-color-on-${prefix}-container`] = `hsl(${h}, ${s}%, 85%)`;
    vars[`--md-sys-color-${prefix}-border`] = `hsl(${h}, ${s}%, 30%)`;
  } else {
    vars[`--md-sys-color-${prefix}`] = `hsl(${h}, ${s}%, 42%)`;
    vars[`--md-sys-color-on-${prefix}`] = `hsl(${h}, ${s}%, 100%)`;
    vars[`--md-sys-color-${prefix}-container`] = `hsl(${h}, ${s}%, 94%)`;
    vars[`--md-sys-color-on-${prefix}-container`] = `hsl(${h}, ${s}%, 15%)`;
    vars[`--md-sys-color-${prefix}-border`] = `hsl(${h}, ${s}%, 85%)`;
  }
  return vars;
}
