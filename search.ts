import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

interface RegistryResult {
  registry: string;
  exists: boolean;
}

async function checkApt(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://packages.debian.org/search?keywords=${pkg}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return !!doc?.querySelector(`a[href*="/${pkg}"]`);
  } catch {
    return false;
  }
}

async function checkDnf(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://apps.fedoraproject.org/packages/s/${pkg}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return !!doc?.querySelector(`a[href$="/${pkg}"]`);
  } catch {
    return false;
  }
}

async function checkPacman(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://archlinux.org/packages/?q=${pkg}`);
    const html = await res.text();
    return html.includes(`<td class="wrap">${pkg}</td>`);
  } catch {
    return false;
  }
}

async function checkSnap(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://snapcraft.io/search?q=${pkg}`);
    const html = await res.text();
    return html.includes(`data-layout="snap" data-snap-name="${pkg}"`);
  } catch {
    return false;
  }
}

async function checkFlatpak(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://flathub.org/apps/search/${pkg}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return !!doc?.querySelector(`div.app-card[data-app-id$=".${pkg}"]`);
  } catch {
    return false;
  }
}

async function checkBrew(pkg: string): Promise<boolean> {
  try {
    const res = await fetch("https://formulae.brew.sh/api/formula.json");
    const data = await res.json();
    return data.some((formula: { name: string }) => formula.name === pkg);
  } catch {
    return false;
  }
}

async function checkNixEnv(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://search.nixos.org/packages?query=${pkg}`);
    const html = await res.text();
    return html.includes(`<div class="package-name">${pkg}</div>`);
  } catch {
    return false;
  }
}

// Add similar functions for other registries...

async function checkPackage(pkg: string): Promise<RegistryResult[]> {
  const checks = [
    { name: "apt", fn: checkApt },
    { name: "dnf", fn: checkDnf },
    { name: "pacman", fn: checkPacman },
    { name: "snap", fn: checkSnap },
    { name: "flatpak", fn: checkFlatpak },
    { name: "brew", fn: checkBrew },
    { name: "nix-env", fn: checkNixEnv },
    // Add other registries here...
  ];

  const results = await Promise.all(
    checks.map(async (check) => ({
      registry: check.name,
      exists: await check.fn(pkg),
    }))
  );

  return results;
}

// Example usage:
const packageName = Deno.args[0];
if (!packageName) {
  console.error("Please provide a package name");
  Deno.exit(1);
}

const results = await checkPackage(packageName);
console.log(results);
